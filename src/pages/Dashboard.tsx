import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Calendar, MessageSquare, DollarSign, TrendingUp } from "lucide-react";

export default function Dashboard() {
  // Mock data - replace with real data from Supabase
  const stats = {
    totalProperties: 3,
    activeBookings: 8,
    totalRevenue: 12450,
    averageRating: 4.8,
    pendingBookings: 2,
    completedBookings: 15,
  };

  const recentBookings = [
    { id: "1", propertyName: "Sunset Villa", guestName: "John Doe", checkIn: "2025-01-15", status: "confirmed" },
    { id: "2", propertyName: "Beach House", guestName: "Jane Smith", checkIn: "2025-01-20", status: "pending" },
    { id: "3", propertyName: "City Apartment", guestName: "Mike Johnson", checkIn: "2025-01-25", status: "confirmed" },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: "default",
      pending: "secondary",
      cancelled: "destructive",
      completed: "outline",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your properties.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              +1 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingBookings} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.completedBookings} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{booking.propertyName}</p>
                    <p className="text-sm text-muted-foreground">Guest: {booking.guestName}</p>
                    <p className="text-sm text-muted-foreground">Check-in: {booking.checkIn}</p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <Home className="h-5 w-5 mr-3 text-primary" />
              <div>
                <p className="font-medium">Add New Property</p>
                <p className="text-sm text-muted-foreground">List a new rental property</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <Calendar className="h-5 w-5 mr-3 text-primary" />
              <div>
                <p className="font-medium">Manage Calendar</p>
                <p className="text-sm text-muted-foreground">Update availability</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <TrendingUp className="h-5 w-5 mr-3 text-primary" />
              <div>
                <p className="font-medium">View Analytics</p>
                <p className="text-sm text-muted-foreground">Track performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}