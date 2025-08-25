-- Create property types enum
CREATE TYPE public.property_type AS ENUM ('hotel', 'villa', 'bungalow', 'attraction', 'apartment', 'guesthouse');

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  property_type property_type NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  price_per_night DECIMAL(10, 2),
  max_guests INTEGER DEFAULT 1,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  host_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policies for properties
CREATE POLICY "Anyone can view active properties" 
ON public.properties 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Hosts can create their own properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own properties" 
ON public.properties 
FOR UPDATE 
USING (auth.uid() = host_id);

CREATE POLICY "Hosts can view their own properties" 
ON public.properties 
FOR SELECT 
USING (auth.uid() = host_id);

-- Create indexes for better search performance
CREATE INDEX idx_properties_type ON public.properties(property_type);
CREATE INDEX idx_properties_location ON public.properties(location);
CREATE INDEX idx_properties_price ON public.properties(price_per_night);
CREATE INDEX idx_properties_guests ON public.properties(max_guests);
CREATE INDEX idx_properties_active ON public.properties(is_active);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create categories table for better organization
CREATE TABLE public.property_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for categories (public read access)
ALTER TABLE public.property_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" 
ON public.property_categories 
FOR SELECT 
USING (true);

-- Insert default categories
INSERT INTO public.property_categories (name, description, icon, color) VALUES
('Hotels', 'Comfortable hotel accommodations', 'hotel', '#3B82F6'),
('Villas', 'Luxury private villas', 'home', '#10B981'),
('Bungalows', 'Cozy bungalow stays', 'tree-pine', '#F59E0B'),
('Attractions', 'Tourist attractions and activities', 'map-pin', '#EF4444'),
('Apartments', 'Modern apartment rentals', 'building-2', '#8B5CF6'),
('Guesthouses', 'Friendly guesthouse accommodations', 'users', '#06B6D4');