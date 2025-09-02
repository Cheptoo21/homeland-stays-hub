import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    if (sessionId && bookingId) {
      verifyPayment();
    } else {
      setLoading(false);
    }
  }, [sessionId, bookingId]);

  const verifyPayment = async () => {
    try {
      console.log('Verifying payment for session:', sessionId, 'booking:', bookingId);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          session_id: sessionId,
          booking_id: bookingId,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('Payment verification result:', data);

      if (data.success && data.booking_status === 'confirmed') {
        setSuccess(true);
        
        // Fetch booking details
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            *,
            properties (
              title,
              location,
              images
            )
          `)
          .eq('id', bookingId)
          .single();

        if (!bookingError && booking) {
          setBookingDetails(booking);
        }

        toast({
          title: "Payment successful!",
          description: "Your booking has been confirmed.",
        });
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setSuccess(false);
      toast({
        title: "Payment verification failed",
        description: "There was an issue verifying your payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="text-center">
              <CardContent className="p-12">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-semibold mb-2">Verifying Payment</h2>
                <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {success ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {success ? "Payment Successful!" : "Payment Failed"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {success && bookingDetails ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">Booking Confirmed</h3>
                    <p className="text-green-700">
                      Your reservation for <strong>{bookingDetails.properties?.title}</strong> has been confirmed.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property:</span>
                      <span className="font-medium">{bookingDetails.properties?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{bookingDetails.properties?.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in:</span>
                      <span className="font-medium">{new Date(bookingDetails.check_in_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out:</span>
                      <span className="font-medium">{new Date(bookingDetails.check_out_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guests:</span>
                      <span className="font-medium">{bookingDetails.total_guests}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-3">
                      <span>Total Paid:</span>
                      <span className="text-primary">${Number(bookingDetails.total_cost).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-700">
                    There was an issue processing your payment. Please contact support or try again.
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </Button>
                {success && (
                  <Button onClick={() => navigate('/bookings')}>
                    View My Bookings
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;