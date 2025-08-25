import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  loading?: boolean;
  className?: string;
}

export interface SearchFilters {
  location?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  guests?: number;
}

const SearchBar = ({ onSearch, loading = false, className }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState<number>(1);

  const handleSearch = () => {
    const filters: SearchFilters = {};
    if (location) filters.location = location;
    if (guests > 0) filters.guests = guests;
    
    onSearch(query, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2",
      className
    )}>
      <div className="flex flex-col md:flex-row gap-2">
        {/* Search Query */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties, attractions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 border-0 bg-transparent text-base h-12 focus-visible:ring-0"
          />
        </div>

        {/* Location */}
        <div className="flex-1 relative border-l border-border/20 md:pl-4">
          <MapPin className="absolute left-3 md:left-7 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Where to?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 md:pl-14 border-0 bg-transparent text-base h-12 focus-visible:ring-0"
          />
        </div>

        {/* Guests */}
        <div className="flex-1 relative border-l border-border/20 md:pl-4">
          <Users className="absolute left-3 md:left-7 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            min="1"
            placeholder="Guests"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
            onKeyPress={handleKeyPress}
            className="pl-10 md:pl-14 border-0 bg-transparent text-base h-12 focus-visible:ring-0"
          />
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          disabled={loading}
          className="h-12 px-8 bg-primary hover:bg-primary/90 text-white rounded-xl"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;