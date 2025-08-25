import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '@/hooks/useSearch';
import { useSearch } from '@/hooks/useSearch';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onApplyFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const SearchFilters = ({ 
  filters, 
  onFiltersChange, 
  onApplyFilters, 
  isOpen, 
  onToggle 
}: SearchFiltersProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { getCategories } = useSearch();

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof SearchFiltersType) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.keys(filters).length;

  if (!isOpen) {
    return (
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="outline" 
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {/* Show active filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters.property_type && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.property_type}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearFilter('property_type')}
                />
              </Badge>
            )}
            {filters.location && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.location}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearFilter('location')}
                />
              </Badge>
            )}
            {(filters.min_price || filters.max_price) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                ${filters.min_price || 0}-${filters.max_price || '∞'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => {
                    clearFilter('min_price');
                    clearFilter('max_price');
                  }}
                />
              </Badge>
            )}
            {filters.guests && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.guests} guests
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearFilter('guests')}
                />
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Search Filters
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Property Type */}
          <div className="space-y-2">
            <Label>Property Type</Label>
            <Select 
              value={filters.property_type || ''} 
              onValueChange={(value) => handleFilterChange('property_type', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any type</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name.toLowerCase().slice(0, -1)}>
                    {category.name.slice(0, -1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="Enter location"
              value={filters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
            />
          </div>

          {/* Guests */}
          <div className="space-y-2">
            <Label>Guests</Label>
            <Input
              type="number"
              min="1"
              placeholder="Number of guests"
              value={filters.guests || ''}
              onChange={(e) => handleFilterChange('guests', parseInt(e.target.value) || undefined)}
            />
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range (per night)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.min_price || ''}
                onChange={(e) => handleFilterChange('min_price', parseInt(e.target.value) || undefined)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.max_price || ''}
                onChange={(e) => handleFilterChange('max_price', parseInt(e.target.value) || undefined)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={clearAllFilters}
            disabled={activeFiltersCount === 0}
          >
            Clear All
          </Button>
          <Button onClick={onApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;