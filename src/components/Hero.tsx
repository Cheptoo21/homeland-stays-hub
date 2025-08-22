import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Search, Users } from "lucide-react";
import heroVilla from "@/assets/hero-villa.jpg";

const Hero = () => {
  return (
    <section 
      className="relative h-[90vh] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroVilla})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container mx-auto px-4 text-center text-white z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Find Your Perfect
          <span className="block bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
            Homeland Stay
          </span>
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto opacity-90">
          Discover amazing homes, hotels, and unique experiences around the world
        </p>
        
        {/* Search Bar */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-white/70" />
              <Input 
                placeholder="Where are you going?"
                className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-white/50"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-white/70" />
              <Input 
                type="date"
                className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-white/50"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-white/70" />
              <Input 
                type="date"
                className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-white/50"
              />
            </div>
            <Button variant="hero" size="lg" className="h-12">
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
    </section>
  );
};

export default Hero;