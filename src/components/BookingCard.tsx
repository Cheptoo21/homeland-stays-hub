import { format } from 'date-fns';
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Booking {
  id: string;
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

interface BookingCardProps {
  booking: Booking;
  userRole?: 'guest' | 'host';
  onStatusChange?: (bookingId: string, status: string) => void;
  onViewDetails?: (booking: Booking) => void;
}

const BookingCard = ({ booking, userRole = 'guest', onStatusChange, onViewDetails }: BookingCardProps) => {
  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: AlertCircle,
      label: 'Pending'
    },
    confirmed: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      label: 'Confirmed'
    },
    cancelled: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
      label: 'Cancelled'
    },
    completed: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: CheckCircle,
      label: 'Completed'
    }
  };

  const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);
  const isUpcoming = checkInDate > new Date();
  const isPast = checkOutDate < new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-card-foreground">
              {booking.properties?.title || 'Property Booking'}
            </CardTitle>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{booking.properties?.location || 'Location not available'}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={status.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                ${Number(booking.total_cost).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                Total cost
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Property Image */}
        {booking.properties?.images?.[0] && (
          <div className="aspect-[16/9] rounded-lg overflow-hidden">
            <img
              src={booking.properties.images[0]}
              alt={booking.properties.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Booking Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Check-in</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(checkInDate, 'MMM dd, yyyy')}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Check-out</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(checkOutDate, 'MMM dd, yyyy')}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{booking.total_guests} {booking.total_guests === 1 ? 'guest' : 'guests'}</span>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>Booked {format(new Date(booking.created_at), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(booking)}
              className="flex-1"
            >
              View Details
            </Button>
          )}
          
          {userRole === 'host' && onStatusChange && booking.status === 'pending' && (
            <>
              <Button 
                size="sm" 
                onClick={() => onStatusChange(booking.id, 'confirmed')}
                className="flex-1"
              >
                Accept
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onStatusChange(booking.id, 'cancelled')}
                className="flex-1"
              >
                Decline
              </Button>
            </>
          )}
          
          {userRole === 'guest' && booking.status === 'pending' && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onStatusChange && onStatusChange(booking.id, 'cancelled')}
              className="flex-1"
            >
              Cancel Booking
            </Button>
          )}
          
          {userRole === 'host' && booking.status === 'confirmed' && isPast && (
            <Button 
              size="sm" 
              onClick={() => onStatusChange && onStatusChange(booking.id, 'completed')}
              className="flex-1"
            >
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;