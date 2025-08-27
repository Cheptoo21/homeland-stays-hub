import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, Edit, Trash2, Plus, Search, MoreHorizontal, Home } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export default function PropertyManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with real data from Supabase
  const properties = [
    {
      id: "1",
      title: "Sunset Villa",
      location: "Malibu, CA",
      type: "villa",
      price: 450,
      status: "active",
      bookings: 12,
      rating: 4.8,
      images: ["/placeholder.svg"],
    },
    {
      id: "2", 
      title: "Beach House Retreat",
      location: "Santa Monica, CA",
      type: "house",
      price: 320,
      status: "active",
      bookings: 8,
      rating: 4.6,
      images: ["/placeholder.svg"],
    },
    {
      id: "3",
      title: "City Center Apartment",
      location: "Downtown LA, CA",
      type: "apartment",
      price: 180,
      status: "inactive",
      bookings: 0,
      rating: 0,
      images: ["/placeholder.svg"],
    },
  ];

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? <Badge variant="default">Active</Badge>
      : <Badge variant="secondary">Inactive</Badge>;
  };

  const handleEdit = (propertyId: string) => {
    navigate(`/dashboard/properties/edit/${propertyId}`);
  };

  const handleView = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleDelete = (propertyId: string) => {
    // TODO: Implement delete logic with confirmation
    console.log("Delete property:", propertyId);
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
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="aspect-video relative bg-muted">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                {getStatusBadge(property.status)}
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
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">${property.price}</span>
                <span className="text-sm text-muted-foreground">per night</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Bookings</p>
                  <p className="font-medium">{property.bookings}</p>
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
        ))}
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