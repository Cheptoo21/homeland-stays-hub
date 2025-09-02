import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, Edit, Trash2, Plus, Search, MoreHorizontal, Home, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function PropertyManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          description,
          location,
          property_type,
          price_per_night,
          max_guests,
          bedrooms,
          bathrooms,
          is_active,
          images,
          created_at,
          bookings(
            id,
            status
          )
        `)
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Process properties to calculate stats
      const processedProperties = (data || []).map(property => {
        const confirmedBookings = property.bookings?.filter(b => b.status === 'confirmed') || [];
        return {
          ...property,
          bookings_count: confirmedBookings.length,
          rating: 4.5 // TODO: Calculate from actual reviews
        };
      });

      setProperties(processedProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast({
        title: "Error loading properties",
        description: "Failed to load your properties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge variant="default">Active</Badge>
      : <Badge variant="secondary">Inactive</Badge>;
  };

  const handleEdit = (propertyId: string) => {
    // TODO: Create edit property page
    toast({
      title: "Edit functionality",
      description: "Edit property functionality coming soon!",
    });
  };

  const handleView = (propertyId: string) => {
    // TODO: Navigate to property detail view
    toast({
      title: "View functionality", 
      description: "Property detail view coming soon!",
    });
  };

  const handleDelete = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: false })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Property deactivated",
        description: "Property has been deactivated successfully.",
      });
      
      loadProperties();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate property.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (propertyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: !currentStatus })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Property ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });
      
      loadProperties();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update property status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Properties</h2>
          <p className="text-muted-foreground">
            Manage your rental properties and track their performance
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/properties/add")} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Property
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-video bg-muted animate-pulse" />
              <CardHeader className="pb-2">
                <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-muted rounded animate-pulse" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="aspect-video relative bg-muted">
                <img
                  src={property.images?.[0] || '/placeholder.svg'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(property.is_active)}
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{property.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(property.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(property.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleToggleStatus(property.id, property.is_active)}
                      >
                        {property.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(property.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-muted-foreground">{property.location}</p>
                <Badge variant="outline" className="w-fit capitalize">
                  {property.property_type}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">${Number(property.price_per_night).toFixed(0)}</span>
                  <span className="text-sm text-muted-foreground">per night</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Bookings</p>
                    <p className="font-medium">{property.bookings_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rating</p>
                    <p className="font-medium">
                      {property.rating > 0 ? `${property.rating} ⭐` : "No reviews"}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleView(property.id)}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(property.id)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No properties found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first property"}
          </p>
          <Button onClick={() => navigate("/dashboard/properties/add")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Property
          </Button>
        </div>
      )}
    </div>
  );
}