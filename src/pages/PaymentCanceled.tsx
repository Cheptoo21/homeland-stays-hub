import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, Home, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const PaymentCanceled = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    toast({
      title: "Payment Canceled",
      description: "Your payment was canceled. Your booking is still pending.",
      variant: "destructive",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <XCircle className="h-16 w-16 text-orange-500" />
              </div>
              <CardTitle className="text-2xl">Payment Canceled</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-2">What happened?</h3>
                <p className="text-orange-700">
                  You canceled the payment process. Don't worry - your booking is still saved as pending, 
                  and you can complete the payment anytime.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">What would you like to do?</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Your booking reservation is held for 24 hours</li>
                  <li>• You can complete payment from your bookings page</li>
                  <li>• Or start a new booking process</li>
                </ul>
              </div>

              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
                <Button 
                  onClick={() => navigate('/bookings')}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Complete Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentCanceled;