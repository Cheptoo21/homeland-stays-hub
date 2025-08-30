import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users, CreditCard, Search, Filter } from 'lucide-react';
import { useBooking } from '@/hooks/useBooking';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import BookingCard from '@/components/BookingCard';
import BookingDetailsModal from '@/components/BookingDetailsModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Bookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const { getUserBookings, updateBookingStatus, loading } = useBooking();
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await getUserBookings();
      setBookings(data || []);
    } catch (error) {
      toast({
        title: "Error loading bookings",
        description: "Failed to load your bookings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (bookingId: string, status: string) => {
    try {
      await updateBookingStatus(bookingId, status);
      toast({
        title: "Booking updated",
        description: "Booking status has been updated successfully.",
      });
      loadBookings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchQuery === '' || 
      booking.properties?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.properties?.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    let matchesTab = true;
    const now = new Date();
    const checkInDate = new Date(booking.check_in_date);
    const checkOutDate = new Date(booking.check_out_date);
    
    switch (activeTab) {
      case 'upcoming':
        matchesTab = checkInDate > now && booking.status === 'confirmed';
        break;
      case 'past':
        matchesTab = checkOutDate < now;
        break;
      case 'pending':
        matchesTab = booking.status === 'pending';
        break;
    }
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getBookingStats = () => {
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      upcoming: bookings.filter(b => {
        const checkIn = new Date(b.check_in_date);
        return checkIn > new Date() && b.status === 'confirmed';
      }).length,
    };
    return stats;
  };

  const stats = getBookingStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your travel bookings and reservations
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      {stats.pending}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                      <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {stats.confirmed}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {stats.upcoming}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search bookings by property or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bookings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Bookings</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-6 mt-6">
                {/* Loading State */}
                {loading && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="aspect-[16/9] w-full mb-4" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Bookings Grid */}
                {!loading && filteredBookings.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        userRole="guest"
                        onStatusChange={handleStatusChange}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!loading && filteredBookings.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="space-y-4">
                        <div className="text-6xl">📅</div>
                        <h3 className="text-xl font-semibold">
                          {activeTab === 'all' ? 'No bookings found' : `No ${activeTab} bookings`}
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          {bookings.length === 0 
                            ? "You haven't made any bookings yet. Start exploring properties to make your first reservation!"
                            : "Try adjusting your search criteria or filters to find the bookings you're looking for."
                          }
                        </p>
                        {bookings.length === 0 && (
                          <Button asChild>
                            <a href="/search">Browse Properties</a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        userRole="guest"
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Bookings;