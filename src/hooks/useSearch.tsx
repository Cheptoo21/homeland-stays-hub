import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  host_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  location?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  guests?: number;
  amenities?: string[];
}

export const useSearch = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProperties = async (query?: string, filters?: SearchFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      let supabaseQuery = supabase
        .from('properties')
        .select('*')
        .eq('is_active', true);

      // Text search in title, description, and location
      if (query && query.trim()) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`
        );
      }

      // Apply filters
      if (filters?.location) {
        supabaseQuery = supabaseQuery.ilike('location', `%${filters.location}%`);
      }
      
      if (filters?.property_type) {
        supabaseQuery = supabaseQuery.eq('property_type', filters.property_type as any);
      }
      
      if (filters?.min_price) {
        supabaseQuery = supabaseQuery.gte('price_per_night', filters.min_price);
      }
      
      if (filters?.max_price) {
        supabaseQuery = supabaseQuery.lte('price_per_night', filters.max_price);
      }
      
      if (filters?.guests) {
        supabaseQuery = supabaseQuery.gte('max_guests', filters.guests);
      }

      // Order by created_at desc to show newest first
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });

      const { data, error: queryError } = await supabaseQuery;

      if (queryError) {
        throw queryError;
      }

      setProperties(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async () => {
    const { data, error } = await supabase
      .from('property_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    
    return data || [];
  };

  return {
    properties,
    loading,
    error,
    searchProperties,
    getCategories,
  };
};