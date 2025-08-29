import { useState } from 'react';
import { X, MapPin, Users, Bed, Bath, Star, Wifi, Car, Waves } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Property } from '@/hooks/useSearch';
import BookingForm from './BookingForm';
import { ReviewCard } from './ReviewCard';

interface PropertyDetailsModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyDetailsModal = ({ property, isOpen, onClose }: PropertyDetailsModalProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!property) return null;

  const amenityIcons: { [key: string]: any } = {
    'wifi': Wifi,
    'parking': Car,
    'pool': Waves,
  };

  const mockReviews = [
    {
      id: '1',
      rating: 5,
      comment: 'Amazing property with great amenities!',
      created_at: '2024-01-15',
      reviewer_id: '1',
      property_id: property.id,
      booking_id: '1',
      reviewer: {
        full_name: 'John Doe'
      }
    },
    {
      id: '2', 
      rating: 4,
      comment: 'Very clean and comfortable stay.',
      created_at: '2024-01-10',
      reviewer_id: '2',
      property_id: property.id,
      booking_id: '2',
      reviewer: {
        full_name: 'Jane Smith'
      }
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Left Column - Images & Details */}
          <div className="flex flex-col">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-2xl font-bold text-card-foreground">
                {property.title}
              </DialogTitle>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location}</span>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1">
              <div className="px-6 space-y-6">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden">
                    <img
                      src={property.images?.[selectedImageIndex] || '/placeholder.svg'}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {property.images && property.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {property.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                            selectedImageIndex === index 
                              ? 'border-primary' 
                              : 'border-border'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${property.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Property Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{property.max_guests} guests</span>
                    </div>
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{property.bedrooms} bedrooms</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span>{property.bathrooms} bathrooms</span>
                    </div>
                  </div>

                  <Badge variant="secondary" className="w-fit">
                    {property.property_type}
                  </Badge>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Amenities</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {property.amenities.map((amenity, index) => {
                        const IconComponent = amenityIcons[amenity.toLowerCase()] || Wifi;
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-primary" />
                            <span className="text-sm capitalize">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Reviews */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold text-lg">Reviews</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.8</span>
                      <span className="text-sm text-muted-foreground">({mockReviews.length} reviews)</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {mockReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right Column - Booking Form */}
          <div className="border-l bg-accent/20">
            <div className="p-6 h-full flex flex-col">
              <BookingForm 
                property={property}
                onClose={onClose}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsModal;