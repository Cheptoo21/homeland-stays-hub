import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Bed, Clock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import heroVilla from "@/assets/hero-villa.jpg";
import heroHotel from "@/assets/hero-hotel.jpg";
import heroBungalow from "@/assets/hero-bungalow.jpg";

const properties = [
  {
    id: 1,
    title: "Luxury Ocean Villa",
    location: "Mombasa Coast",
    bedrooms: 3,
    guests: 6,
    driveTime: "5 mins from town",
    rating: 4.9,
    reviews: 127,
    price: "KSh 15,000",
    image: heroVilla,
    type: "Villa",
    otherUnits: "2 x 2-bedroom apartments"
  },
  {
    id: 2,
    title: "Beachfront Resort Hotel",
    location: "Malindi Beach",
    bedrooms: 1,
    guests: 2,
    driveTime: "10 mins from airport",
    rating: 4.7,
    reviews: 89,
    price: "KSh 8,500",
    image: heroHotel,
    type: "Hotel",
    otherUnits: "50+ rooms available"
  },
  {
    id: 3,
    title: "Mountain Retreat Bungalow",
    location: "Aberdare Ranges",
    bedrooms: 2,
    guests: 4,
    driveTime: "15 mins from Nyeri",
    rating: 4.8,
    reviews: 64,
    price: "KSh 6,500",
    image: heroBungalow,
    type: "Bungalow",
    otherUnits: "3 x similar bungalows"
  }
];

const FeaturedProperties = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBookNow = (property: typeof properties[0]) => {
    // For now, show a toast message since booking system isn't implemented yet
    toast({
      title: "Booking Interest Registered!",
      description: `We'll redirect you to book "${property.title}" soon. Booking system coming next!`,
    });
    
    // TODO: Navigate to booking page when implemented
    // navigate(`/book/${property.id}`);
  };

  const handleViewAll = () => {
    navigate('/search');
  };
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Featured Properties
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Handpicked accommodations offering the best experiences
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <Card 
              key={property.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground">
                  {property.type}
                </Badge>
                <div className="absolute top-4 right-4 flex items-center bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-white text-sm font-medium">{property.rating}</span>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{property.title}</h3>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1 text-primary" />
                    <span>{property.bedrooms} bedrooms</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-primary" />
                    <span>{property.guests} guests max</span>
                  </div>
                  <div className="flex items-center col-span-2">
                    <Clock className="h-4 w-4 mr-1 text-primary" />
                    <span>{property.driveTime}</span>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Other units: {property.otherUnits}
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <span className="text-2xl font-bold text-primary">{property.price}</span>
                    <span className="text-muted-foreground">/night</span>
                    <div className="text-xs text-muted-foreground">
                      {property.reviews} reviews
                    </div>
                  </div>
                  <Button 
                    variant="default" 
                    className="hover:bg-primary-hover"
                    onClick={() => handleBookNow(property)}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" onClick={handleViewAll}>
            View All Properties
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;