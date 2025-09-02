import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentRetryButtonProps {
  booking: any;
  onPaymentStarted?: () => void;
}

const PaymentRetryButton = ({ booking, onPaymentStarted }: PaymentRetryButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRetryPayment = async () => {
    if (booking.status !== 'pending') {
      toast({
        title: "Cannot retry payment",
        description: "This booking is not in pending status.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          booking_id: booking.id,
          property_title: booking.properties?.title || 'Property Booking',
          amount: Number(booking.total_cost),
          currency: 'usd'
        }
      });

      if (error || !data?.url) {
        throw new Error(error?.message || 'Payment session creation failed');
      }

      toast({
        title: "Redirecting to payment",
        description: "Opening secure payment page...",
      });

      // Open payment page
      window.open(data.url, '_blank');
      
      if (onPaymentStarted) {
        onPaymentStarted();
      }

    } catch (error) {
      console.error('Payment retry error:', error);
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Failed to start payment process.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (booking.status !== 'pending') {
    return null;
  }

  return (
    <Button 
      onClick={handleRetryPayment}
      disabled={loading}
      className="flex items-center gap-2"
      size="sm"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      {loading ? "Starting Payment..." : "Complete Payment"}
    </Button>
  );
};

export default PaymentRetryButton;