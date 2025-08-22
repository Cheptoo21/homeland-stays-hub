import { Button } from "@/components/ui/button";
import { Home, Menu, User, Heart, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Signed out',
        description: 'Successfully signed out',
      });
    }
  };

  const handleAuthClick = () => {
    if (user) {
      handleSignOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">HomelandBooking</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white hover:text-white/80 transition-colors">Stays</a>
            <a href="#" className="text-white hover:text-white/80 transition-colors">Experiences</a>
            <a href="#" className="text-white hover:text-white/80 transition-colors">Host</a>
            <a href="#" className="text-white hover:text-white/80 transition-colors">Help</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white hover:text-white/80 hidden md:flex">
              List Your Property
            </Button>
            {user && (
              <Button variant="glass" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            )}
            <Button variant="glass" size="icon" onClick={handleAuthClick}>
              {user ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            </Button>
            <Button variant="glass" size="icon" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;