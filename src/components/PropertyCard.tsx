import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Users, Bed, Bath, Star } from 'lucide-react';
import { Property } from '@/hooks/useSearch';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

const PropertyCard = ({ property, onClick }: PropertyCardProps) => {
  const mainImage = property.images?.[0] || '/placeholder.svg';
  
  const formatPropertyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 bg-card border-border/50"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-foreground">
            {formatPropertyType(property.property_type)}
          </Badge>
        </div>
        {property.price_per_night && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-primary-foreground">
              ${property.price_per_night}/night
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-card-foreground line-clamp-1">
            {property.title}
          </h3>
          
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
          
          <p className="text-muted-foreground text-sm line-clamp-2">
            {property.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{property.max_guests} guests</span>
            </div>
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms} bath</span>
            </div>
          </div>
          
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{property.amenities.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;