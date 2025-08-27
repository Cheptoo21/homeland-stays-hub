-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_guests INTEGER NOT NULL DEFAULT 1,
  total_cost DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  host_reply TEXT,
  host_reply_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

-- Create property availability table
CREATE TABLE public.property_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  price_override DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, date)
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_availability ENABLE ROW LEVEL SECURITY;

-- Booking policies
CREATE POLICY "Guests can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = guest_id);

CREATE POLICY "Hosts can view bookings for their properties" ON public.bookings
  FOR SELECT USING (
    auth.uid() IN (
      SELECT host_id FROM public.properties WHERE id = property_id
    )
  );

CREATE POLICY "Guests can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Hosts can update bookings for their properties" ON public.bookings
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT host_id FROM public.properties WHERE id = property_id
    )
  );

-- Review policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Guests can create reviews for their completed bookings" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id 
      AND guest_id = auth.uid() 
      AND status = 'completed'
    )
  );

CREATE POLICY "Hosts can update reviews (for replies) on their properties" ON public.reviews
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT host_id FROM public.properties WHERE id = property_id
    )
  );

-- Property availability policies
CREATE POLICY "Anyone can view availability" ON public.property_availability
  FOR SELECT USING (true);

CREATE POLICY "Hosts can manage availability for their properties" ON public.property_availability
  FOR ALL USING (
    auth.uid() IN (
      SELECT host_id FROM public.properties WHERE id = property_id
    )
  );

-- Create indexes for performance
CREATE INDEX idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX idx_bookings_guest_id ON public.bookings(guest_id);
CREATE INDEX idx_bookings_dates ON public.bookings(check_in_date, check_out_date);
CREATE INDEX idx_reviews_property_id ON public.reviews(property_id);
CREATE INDEX idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX idx_property_availability_property_date ON public.property_availability(property_id, date);

-- Add updated_at triggers
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check booking availability
CREATE OR REPLACE FUNCTION public.check_booking_availability(
  p_property_id UUID,
  p_check_in DATE,
  p_check_out DATE
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if there are any overlapping confirmed bookings
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE property_id = p_property_id
    AND status IN ('confirmed', 'pending')
    AND (
      (check_in_date <= p_check_in AND check_out_date > p_check_in) OR
      (check_in_date < p_check_out AND check_out_date >= p_check_out) OR
      (check_in_date >= p_check_in AND check_out_date <= p_check_out)
    )
  ) THEN
    RETURN FALSE;
  END IF;

  -- Check availability calendar
  IF EXISTS (
    SELECT 1 FROM public.property_availability
    WHERE property_id = p_property_id
    AND date >= p_check_in
    AND date < p_check_out
    AND is_available = FALSE
  ) THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;