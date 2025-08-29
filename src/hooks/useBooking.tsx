import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BookingData {
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  total_guests: number;
  total_cost: number;
}

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (bookingData: BookingData) => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw new Error('Authentication required');
      if (!user) throw new Error('User not found');

      // Check availability
      const { data: availability, error: availabilityError } = await supabase
        .rpc('check_booking_availability', {
          p_property_id: bookingData.property_id,
          p_check_in: bookingData.check_in_date,
          p_check_out: bookingData.check_out_date,
        });

      if (availabilityError) throw availabilityError;
      if (!availability) throw new Error('Property is not available for the selected dates');

      // Create booking
      const { data, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          property_id: bookingData.property_id,
          guest_id: user.id,
          check_in_date: bookingData.check_in_date,
          check_out_date: bookingData.check_out_date,
          total_guests: bookingData.total_guests,
          total_cost: bookingData.total_cost,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          properties (
            title,
            location,
            images,
            property_type
          )
        `)
        .eq('guest_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBooking,
    getUserBookings,
    updateBookingStatus,
    loading,
    error
  };
};