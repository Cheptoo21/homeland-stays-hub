import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  session_id: string;
  booking_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[VERIFY-PAYMENT] Function started");

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

    console.log("[VERIFY-PAYMENT] User authenticated:", userData.user.email);

    // Parse request body
    const { session_id, booking_id }: VerifyPaymentRequest = await req.json();
    
    if (!session_id || !booking_id) {
      throw new Error("Missing session_id or booking_id");
    }

    console.log("[VERIFY-PAYMENT] Verifying payment for session:", session_id, "booking:", booking_id);

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe secret key not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (!session) {
      throw new Error("Payment session not found");
    }

    console.log("[VERIFY-PAYMENT] Session status:", session.payment_status);

    // Verify booking belongs to user
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .eq("guest_id", userData.user.id)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found or unauthorized");
    }

    let newStatus = booking.status;
    let paymentInfo = null;

    // Update booking status based on payment status
    if (session.payment_status === "paid") {
      newStatus = "confirmed";
      paymentInfo = {
        payment_intent_id: session.payment_intent,
        payment_status: "paid",
        payment_amount: session.amount_total,
        currency: session.currency,
      };
      console.log("[VERIFY-PAYMENT] Payment successful, confirming booking");
    } else if (session.payment_status === "unpaid") {
      newStatus = "cancelled";
      console.log("[VERIFY-PAYMENT] Payment failed, cancelling booking");
    }

    // Update booking in database
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (paymentInfo) {
      updateData.payment_intent_id = paymentInfo.payment_intent_id;
      updateData.payment_status = paymentInfo.payment_status;
    }

    const { error: updateError } = await supabaseClient
      .from("bookings")
      .update(updateData)
      .eq("id", booking_id);

    if (updateError) {
      console.error("[VERIFY-PAYMENT] Error updating booking:", updateError);
      throw updateError;
    }

    console.log("[VERIFY-PAYMENT] Booking updated successfully with status:", newStatus);

    return new Response(JSON.stringify({
      success: true,
      booking_status: newStatus,
      payment_status: session.payment_status,
      session_id: session_id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[VERIFY-PAYMENT] ERROR:", errorMessage);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});