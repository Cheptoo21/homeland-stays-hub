import { Home, Hotel, TreePine, MapPin, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import heroHotel from "@/assets/hero-hotel.jpg";
import heroBungalow from "@/assets/hero-bungalow.jpg";
import heroAttractions from "@/assets/hero-attractions.jpg";
import heroVilla from "@/assets/hero-villa.jpg";

const categories = [
  {
    title: "Airbnb Homes",
    description: "Unique homes with local character",
    icon: Home,
    image: heroVilla,
    count: "1,000+"
  },
  {
    title: "Hotels",
    description: "Professional hospitality & service",
    icon: Hotel,
    image: heroHotel,
    count: "500+"
  },
  {
    title: "Villas",
    description: "Luxury private retreats",
    icon: Home,
    image: heroVilla,
    count: "300+"
  },
  {
    title: "Bungalows",
    description: "Cozy nature escapes",
    icon: TreePine,
    image: heroBungalow,
    count: "200+"
  },
  {
    title: "Attractions",
    description: "Adventures & experiences",
    icon: Camera,
    image: heroAttractions,
    count: "150+"
  }
];

const Categories = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-primary-light/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Explore by Category
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the perfect accommodation for every type of traveler
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card 
                key={index}
                className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 mb-2">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-lg">{category.title}</h3>
                    <p className="text-white/80 text-sm">{category.count} properties</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-muted-foreground text-sm">{category.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;