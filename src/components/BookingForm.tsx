import { useState } from 'react';
import { format, differenceInDays, addDays } from 'date-fns';
import { CalendarIcon, Users, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Property } from '@/hooks/useSearch';
import { useBooking } from '@/hooks/useBooking';
import { useToast } from '@/hooks/use-toast';

interface BookingFormProps {
  property: Property;
  onClose: () => void;
}

const BookingForm = ({ property, onClose }: BookingFormProps) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  const { createBooking, loading } = useBooking();
  const { toast } = useToast();

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const basePrice = property.price_per_night ? Number(property.price_per_night) : 0;
  const subtotal = nights * basePrice;
  const serviceFee = subtotal * 0.1; // 10% service fee
  const total = subtotal + serviceFee;

  const handleGuestChange = (increment: number) => {
    const newCount = Math.max(1, Math.min(property.max_guests || 8, guests + increment));
    setGuests(newCount);
  };

  const handleCheckInChange = (date: Date | undefined) => {
    setCheckIn(date);
    if (date && checkOut && date >= checkOut) {
      setCheckOut(addDays(date, 1));
    }
  };

  const handleBookNow = async () => {
    if (!checkIn || !checkOut) {
      toast({
        title: "Missing dates",
        description: "Please select check-in and check-out dates.",
        variant: "destructive",
      });
      return;
    }

    if (guests > (property.max_guests || 8)) {
      toast({
        title: "Too many guests",
        description: `This property accommodates maximum ${property.max_guests} guests.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await createBooking({
        property_id: property.id,
        check_in_date: format(checkIn, 'yyyy-MM-dd'),
        check_out_date: format(checkOut, 'yyyy-MM-dd'),
        total_guests: guests,
        total_cost: total,
      });

      toast({
        title: "Booking successful!",
        description: "Your booking has been confirmed.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Price Header */}
      <div className="text-center">
        <div className="text-3xl font-bold text-primary">
          ${basePrice}
          <span className="text-lg font-normal text-muted-foreground">/night</span>
        </div>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-6 space-y-6">
          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Check-in</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "MMM dd") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={handleCheckInChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Check-out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "MMM dd") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => !checkIn || date <= checkIn}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Guest Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Guests</Label>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{guests} {guests === 1 ? 'guest' : 'guests'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGuestChange(-1)}
                  disabled={guests <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGuestChange(1)}
                  disabled={guests >= (property.max_guests || 8)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      {checkIn && checkOut && nights > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between">
              <span>${basePrice} x {nights} nights</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Service fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Book Button */}
      <Button 
        onClick={handleBookNow}
        disabled={!checkIn || !checkOut || loading}
        className="w-full h-12 text-lg font-semibold"
        size="lg"
      >
        {loading ? "Processing..." : "Reserve"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        You won't be charged yet
      </p>
    </div>
  );
};

export default BookingForm;