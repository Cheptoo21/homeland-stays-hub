import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  booking_id: string;
  property_title: string;
  amount: number;
  currency?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[CREATE-PAYMENT] Function started");

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Authentication required");
    }
    
    console.log("[CREATE-PAYMENT] User authenticated:", userData.user.email);

    // Parse request body
    const { booking_id, property_title, amount, currency = "usd" }: PaymentRequest = await req.json();
    
    if (!booking_id || !property_title || !amount) {
      throw new Error("Missing required fields: booking_id, property_title, amount");
    }

    console.log("[CREATE-PAYMENT] Processing payment for booking:", booking_id, "Amount:", amount);

    // Verify booking exists and belongs to user
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("*, properties(title)")
      .eq("id", booking_id)
      .eq("guest_id", userData.user.id)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found or unauthorized");
    }

    if (booking.status !== "pending") {
      throw new Error("Booking is not in pending status");
    }

    console.log("[CREATE-PAYMENT] Booking verified:", booking.id);

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe secret key not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: userData.user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("[CREATE-PAYMENT] Existing customer found:", customerId);
    } else {
      console.log("[CREATE-PAYMENT] Creating new customer");
    }

    // Get origin for redirect URLs
    const origin = req.headers.get("origin") || "https://efb70bf5-a815-4180-bfd9-18dc4be885a3.lovableproject.com";

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userData.user.email,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Booking: ${property_title}`,
              description: `Booking reservation for ${property_title}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking_id}`,
      cancel_url: `${origin}/payment-canceled?booking_id=${booking_id}`,
      metadata: {
        booking_id: booking_id,
        user_id: userData.user.id,
      },
    });

    console.log("[CREATE-PAYMENT] Checkout session created:", session.id);

    // Update booking with payment session ID
    const { error: updateError } = await supabaseClient
      .from("bookings")
      .update({ 
        payment_session_id: session.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", booking_id);

    if (updateError) {
      console.error("[CREATE-PAYMENT] Error updating booking:", updateError);
      throw updateError;
    }

    console.log("[CREATE-PAYMENT] Session created successfully");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-PAYMENT] ERROR:", errorMessage);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});