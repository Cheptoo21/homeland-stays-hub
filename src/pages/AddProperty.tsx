import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ImageUpload from "@/components/ImageUpload";

export default function AddProperty() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    address: "",
    property_type: "",
    price_per_night: "",
    max_guests: "1",
    bedrooms: "1",
    bathrooms: "1",
    amenities: [] as string[],
  });

  const amenitiesList = [
    "WiFi", "Kitchen", "Washing Machine", "Air Conditioning", "Heating",
    "TV", "Parking", "Pool", "Hot Tub", "Fireplace", "Balcony", "Garden",
    "Pet Friendly", "Gym", "Beach Access", "Mountain View"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add a property.",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image of your property.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('properties').insert({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        property_type: formData.property_type as 'hotel' | 'villa' | 'bungalow' | 'attraction' | 'apartment' | 'guesthouse',
        price_per_night: parseFloat(formData.price_per_night),
        max_guests: parseInt(formData.max_guests),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        amenities: formData.amenities,
        images: images,
        host_id: user.id,
        is_active: true
      });

      if (error) throw error;

      toast({
        title: "Property Added Successfully!",
        description: "Your property is now live and available for booking.",
      });

      navigate("/dashboard/properties");
    } catch (error) {
      console.error('Property creation error:', error);
      toast({
        title: "Error Adding Property",
        description: error instanceof Error ? error.message : "Failed to add property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard/properties")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Property</h2>
          <p className="text-muted-foreground">
            List your property for guests to discover and book
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Beautiful beachfront villa..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type *</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => handleInputChange("property_type", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="guesthouse">Guesthouse</SelectItem>
                    <SelectItem value="bungalow">Bungalow</SelectItem>
                    <SelectItem value="attraction">Attraction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your property, its unique features, and what makes it special..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="City, State"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main St, City, State, Zip"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="price_per_night">Price per Night ($) *</Label>
                <Input
                  id="price_per_night"
                  type="number"
                  value={formData.price_per_night}
                  onChange={(e) => handleInputChange("price_per_night", e.target.value)}
                  placeholder="150"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_guests">Max Guests *</Label>
                <Input
                  id="max_guests"
                  type="number"
                  value={formData.max_guests}
                  onChange={(e) => handleInputChange("max_guests", e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms *</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms *</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityToggle(amenity)}
                  />
                  <Label htmlFor={amenity} className="text-sm">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload 
              images={images}
              onImagesChange={setImages}
              maxImages={10}
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/properties")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding Property..." : "Add Property"}
          </Button>
        </div>
      </form>
    </div>
  );
}