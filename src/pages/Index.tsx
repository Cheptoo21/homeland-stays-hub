import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedProperties from "@/components/FeaturedProperties";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedProperties />
        
        {/* Quick access to dashboard - temporary for development */}
        <div className="container mx-auto px-4 py-8 text-center">
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Go to Host Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;