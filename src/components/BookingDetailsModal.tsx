import { format } from 'date-fns';
import { X, MapPin, Calendar, Users, CreditCard, Clock, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

interface Booking {
  id: string;
  property_id: string;
  guest_id: string;
  check_in_date: string;
  check_out_date: string;
  total_guests: number;
  total_cost: number;
  status: string;
  created_at: string;
  properties?: {
    title: string;
    location: string;
    images: string[];
    property_type: string;
  };
}

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'guest' | 'host';
  onStatusChange?: (bookingId: string, status: string) => void;
}

const BookingDetailsModal = ({ 
  booking, 
  isOpen, 
  onClose, 
  userRole = 'guest',
  onStatusChange 
}: BookingDetailsModalProps) => {
  if (!booking) return null;

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
    confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed', icon: Calendar },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: X },
    completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed', icon: Star },
  };

  const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);
  const createdDate = new Date(booking.created_at);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            Booking Details
            <Badge className={`${config.color} border-0`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Information */}
          {booking.properties && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {booking.properties.images?.[0] && (
                    <img
                      src={booking.properties.images[0]}
                      alt={booking.properties.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{booking.properties.title}</h3>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{booking.properties.location}</span>
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {booking.properties.property_type}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Check-in
                </h4>
                <div>
                  <p className="font-medium">{format(checkInDate, 'EEEE, MMMM d, yyyy')}</p>
                  <p className="text-sm text-muted-foreground">After 3:00 PM</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Check-out
                </h4>
                <div>
                  <p className="font-medium">{format(checkOutDate, 'EEEE, MMMM d, yyyy')}</p>
                  <p className="text-sm text-muted-foreground">Before 11:00 AM</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guest and Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Guests
                </h4>
                <p className="text-lg">{booking.total_guests} {booking.total_guests === 1 ? 'guest' : 'guests'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Total Cost
                </h4>
                <p className="text-lg font-bold text-primary">${Number(booking.total_cost).toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Booking Timeline */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Booking Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="font-medium">Booking Created:</span>
                  <span className="text-muted-foreground">
                    {format(createdDate, 'MMM d, yyyy \'at\' h:mm a')}
                  </span>
                </div>
                {booking.status === 'confirmed' && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-medium">Confirmed</span>
                  </div>
                )}
                {booking.status === 'completed' && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="font-medium">Completed</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Host Actions */}
          {userRole === 'host' && booking.status === 'pending' && onStatusChange && (
            <div className="flex gap-3">
              <Button 
                onClick={() => onStatusChange(booking.id, 'confirmed')}
                className="flex-1"
              >
                Accept Booking
              </Button>
              <Button 
                variant="outline"
                onClick={() => onStatusChange(booking.id, 'cancelled')}
                className="flex-1"
              >
                Decline Booking
              </Button>
            </div>
          )}

          {/* Guest Actions */}
          {userRole === 'guest' && booking.status === 'pending' && onStatusChange && (
            <Button 
              variant="outline"
              onClick={() => onStatusChange(booking.id, 'cancelled')}
              className="w-full"
            >
              Cancel Booking
            </Button>
          )}

          <Separator />

          {/* Booking ID */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Booking ID: <span className="font-mono">{booking.id}</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsModal;