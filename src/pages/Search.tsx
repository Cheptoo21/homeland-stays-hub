import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import SearchFilters from '@/components/SearchFilters';
import PropertyCard from '@/components/PropertyCard';
import PropertyDetailsModal from '@/components/PropertyDetailsModal';
import Categories from '@/components/Categories';
import { useSearch, SearchFilters as SearchFiltersType, Property } from '@/hooks/useSearch';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const { properties, loading, error, searchProperties } = useSearch();

  useEffect(() => {
    // Initialize search from URL params
    const initialQuery = searchParams.get('q') || '';
    const initialFilters: SearchFiltersType = {};
    
    if (searchParams.get('location')) {
      initialFilters.location = searchParams.get('location')!;
    }
    if (searchParams.get('type')) {
      initialFilters.property_type = searchParams.get('type')!;
    }
    if (searchParams.get('guests')) {
      initialFilters.guests = parseInt(searchParams.get('guests')!);
    }
    if (searchParams.get('min_price')) {
      initialFilters.min_price = parseInt(searchParams.get('min_price')!);
    }
    if (searchParams.get('max_price')) {
      initialFilters.max_price = parseInt(searchParams.get('max_price')!);
    }

    setQuery(initialQuery);
    setFilters(initialFilters);
    
    // Perform initial search
    searchProperties(initialQuery, initialFilters);
  }, []);

  const handleSearch = (searchQuery: string, searchFilters: SearchFiltersType) => {
    setQuery(searchQuery);
    setFilters(searchFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchFilters.location) params.set('location', searchFilters.location);
    if (searchFilters.property_type) params.set('type', searchFilters.property_type);
    if (searchFilters.guests) params.set('guests', searchFilters.guests.toString());
    if (searchFilters.min_price) params.set('min_price', searchFilters.min_price.toString());
    if (searchFilters.max_price) params.set('max_price', searchFilters.max_price.toString());
    
    setSearchParams(params);
    searchProperties(searchQuery, searchFilters);
  };

  const handleApplyFilters = () => {
    handleSearch(query, filters);
    setShowFilters(false);
  };

  const handleCategorySelect = (category: string) => {
    const newFilters = { ...filters, property_type: category.toLowerCase() };
    handleSearch(query, newFilters);
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsPropertyModalOpen(true);
  };

  const handleClosePropertyModal = () => {
    setIsPropertyModalOpen(false);
    setSelectedProperty(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar 
              onSearch={handleSearch}
              loading={loading}
            />
          </div>

          {/* Categories */}
          <div className="mb-8">
            <Categories onCategorySelect={handleCategorySelect} />
          </div>

          {/* Filters */}
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            onApplyFilters={handleApplyFilters}
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />

          {/* Results */}
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {loading ? 'Searching...' : `${properties.length} properties found`}
              </h2>
            </div>

            {/* Error State */}
            {error && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-6">
                  <p className="text-destructive">
                    Error loading properties: {error}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onClick={() => handlePropertyClick(property)}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && properties.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="text-6xl">🏠</div>
                    <h3 className="text-xl font-semibold">No properties found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Try adjusting your search criteria or browse our available categories.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isPropertyModalOpen}
        onClose={handleClosePropertyModal}
      />
    </div>
  );
};

export default Search;