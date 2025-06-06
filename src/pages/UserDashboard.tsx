
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { bookingAPI, userAPI } from '@/services/api';
import { Booking, Hotel, Room } from '@/types';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Hotel as HotelIcon, 
  Calendar, 
  CreditCard, 
  Edit, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Check,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, differenceInCalendarDays, isBefore, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Helper function to format dates
const formatDate = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return format(date, 'MMM dd, yyyy');
};

const UserDashboard = () => {
  const { state } = useAuth();
  const { user } = state;
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState(user);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  
  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        const data = await bookingAPI.getUserBookings(user._id);
        
        // For demo purposes, create some mock bookings if none exist
        if (!data || data.length === 0) {
          // Create mock bookings
          setBookings([
            {
              _id: 'b1',
              userId: user._id,
              hotelId: 'h1',
              roomId: 'r1',
              roomNumber: 101,
              dateStart: new Date(new Date().setDate(new Date().getDate() + 5)),
              dateEnd: new Date(new Date().setDate(new Date().getDate() + 8)),
              totalPrice: 897,
              status: 'confirmed',
              createdAt: new Date(),
              hotel: {
                _id: 'h1',
                name: 'Grand Plaza Hotel',
                city: 'New York',
                address: '123 Broadway, New York, NY',
                photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
                rating: 4.8
              },
              room: {
                _id: 'r1',
                title: 'Deluxe King Room',
                price: 299,
                maxPeople: 2
              }
            },
            {
              _id: 'b2',
              userId: user._id,
              hotelId: 'h2',
              roomId: 'r2',
              roomNumber: 202,
              dateStart: new Date(new Date().setDate(new Date().getDate() - 15)),
              dateEnd: new Date(new Date().setDate(new Date().getDate() - 10)),
              totalPrice: 1745,
              status: 'completed',
              createdAt: new Date(new Date().setDate(new Date().getDate() - 20)),
              hotel: {
                _id: 'h2',
                name: 'Seaside Resort',
                city: 'Miami',
                address: '555 Ocean Drive, Miami, FL',
                photos: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'],
                rating: 4.6
              },
              room: {
                _id: 'r2',
                title: 'Ocean View Suite',
                price: 349,
                maxPeople: 3
              }
            }
          ]);
        } else {
          setBookings(data);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load your bookings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?._id) return;
    
    try {
      // Create shallow copy without password for security
      const { password, ...profileData } = userProfile;
      
      await userAPI.updateUser(user._id, profileData);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      await bookingAPI.cancelBooking(selectedBooking);
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking._id === selectedBooking 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ));
      
      setCancelDialogOpen(false);
      setSelectedBooking(null);
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };
  
  const openCancelDialog = (bookingId: string) => {
    setSelectedBooking(bookingId);
    setCancelDialogOpen(true);
  };

  if (!user) return null;

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow py-16 bg-gray-50">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
              {/* Sidebar */}
              <div className="w-full md:w-1/4">
                <Card className="sticky top-24">
                  <CardHeader className="text-center">
                    <div className="w-20 h-20 mx-auto bg-hotel-100 rounded-full flex items-center justify-center mb-4">
                      {user.img ? (
                        <img 
                          src={user.img} 
                          alt={user.username} 
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-hotel-500" />
                      )}
                    </div>
                    <CardTitle>{user.username}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger 
                        value="bookings" 
                        onClick={() => setActiveTab('bookings')}
                        className={activeTab === 'bookings' ? 'bg-hotel-100 text-hotel-700' : ''}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Bookings
                      </TabsTrigger>
                      <TabsTrigger 
                        value="profile" 
                        onClick={() => setActiveTab('profile')}
                        className={activeTab === 'profile' ? 'bg-hotel-100 text-hotel-700' : ''}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </TabsTrigger>
                    </TabsList>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/hotels')}>
                      <HotelIcon className="h-4 w-4 mr-2" />
                      Browse Hotels
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {/* Main Content */}
              <div className="w-full md:w-3/4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  {/* Bookings Tab */}
                  <TabsContent value="bookings" className="mt-0 animate-fade-in">
                    <Card>
                      <CardHeader>
                        <CardTitle>My Bookings</CardTitle>
                        <CardDescription>
                          View and manage your hotel reservations
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="border rounded-lg p-4 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              </div>
                            ))}
                          </div>
                        ) : bookings.length === 0 ? (
                          <div className="text-center py-8">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                            <p className="text-muted-foreground mb-4">
                              You haven't made any hotel reservations yet
                            </p>
                            <Button 
                              onClick={() => navigate('/hotels')}
                              className="bg-hotel-500 hover:bg-hotel-600"
                            >
                              Find Hotels
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {bookings.map((booking, index) => (
                              <div 
                                key={booking._id} 
                                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                              >
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                  {/* Image */}
                                  <div className="md:col-span-3 aspect-[4/3] overflow-hidden">
                                    <img 
                                      src={booking.hotel.photos[0] || '/placeholder.svg'} 
                                      alt={booking.hotel.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  
                                  {/* Details */}
                                  <div className="p-4 md:col-span-6 flex flex-col">
                                    <div>
                                      <h3 className="font-medium text-lg">{booking.hotel.name}</h3>
                                      <p className="text-sm text-muted-foreground flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {booking.hotel.city}
                                      </p>
                                    </div>
                                    
                                    <div className="mt-2 space-y-1">
                                      <p className="text-sm">
                                        <span className="font-medium">Room:</span> {booking.room.title} (Room {booking.roomNumber})
                                      </p>
                                      <p className="text-sm">
                                        <span className="font-medium">Dates:</span> {formatDate(booking.dateStart)} - {formatDate(booking.dateEnd)}
                                      </p>
                                      <p className="text-sm">
                                        <span className="font-medium">Guests:</span> {booking.room.maxPeople} max
                                      </p>
                                    </div>
                                    
                                    <div className="mt-auto pt-2">
                                      <Link 
                                        to={`/hotels/${booking.hotelId}`}
                                        className="text-hotel-500 hover:text-hotel-600 text-sm font-medium"
                                      >
                                        View Hotel
                                      </Link>
                                    </div>
                                  </div>
                                  
                                  {/* Price and Status */}
                                  <div className="p-4 bg-gray-50 md:col-span-3">
                                    <div className="space-y-4">
                                      <div>
                                        <p className="text-sm text-muted-foreground">Total Price</p>
                                        <p className="text-lg font-semibold">${booking.totalPrice}</p>
                                      </div>
                                      
                                      <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <div className="flex items-center mt-1">
                                          {booking.status === 'confirmed' ? (
                                            <>
                                              <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                                              <span className="text-green-600 font-medium">Confirmed</span>
                                            </>
                                          ) : booking.status === 'cancelled' ? (
                                            <>
                                              <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
                                              <span className="text-red-600 font-medium">Cancelled</span>
                                            </>
                                          ) : (
                                            <>
                                              <span className="h-2 w-2 bg-gray-500 rounded-full mr-2"></span>
                                              <span className="text-gray-600 font-medium">Completed</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {booking.status === 'confirmed' && isBefore(new Date(), parseISO(booking.dateStart.toString())) && (
                                        <Button 
                                          variant="outline" 
                                          className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                          onClick={() => openCancelDialog(booking._id)}
                                        >
                                          Cancel Booking
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Profile Tab */}
                  <TabsContent value="profile" className="mt-0 animate-fade-in">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>
                            View and update your profile details
                          </CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditMode(!editMode)}
                        >
                          {editMode ? (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </>
                          ) : (
                            <>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Profile
                            </>
                          )}
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {editMode ? (
                          <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                  id="username"
                                  name="username"
                                  value={userProfile.username}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={userProfile.email}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                  id="country"
                                  name="country"
                                  value={userProfile.country}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                  id="city"
                                  name="city"
                                  value={userProfile.city}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="phone">Phone (optional)</Label>
                                <Input
                                  id="phone"
                                  name="phone"
                                  type="tel"
                                  value={userProfile.phone || ''}
                                  onChange={handleInputChange}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="img">Profile Image URL (optional)</Label>
                                <Input
                                  id="img"
                                  name="img"
                                  value={userProfile.img || ''}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                            
                            <div className="pt-4 flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" className="bg-hotel-500 hover:bg-hotel-600">
                                Save Changes
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-6">
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-hotel-500" />
                                <h3 className="font-medium">Account Information</h3>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                                <div>
                                  <p className="text-sm text-muted-foreground">Username</p>
                                  <p className="font-medium">{user.username}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Email</p>
                                  <p className="font-medium">{user.email}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-5 w-5 text-hotel-500" />
                                <h3 className="font-medium">Location</h3>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                                <div>
                                  <p className="text-sm text-muted-foreground">Country</p>
                                  <p className="font-medium">{user.country}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">City</p>
                                  <p className="font-medium">{user.city}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-5 w-5 text-hotel-500" />
                                <h3 className="font-medium">Contact</h3>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                                <div>
                                  <p className="text-sm text-muted-foreground">Phone</p>
                                  <p className="font-medium">{user.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Email</p>
                                  <p className="font-medium">{user.email}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5 text-hotel-500" />
                                <h3 className="font-medium">Account Status</h3>
                              </div>
                              
                              <div className="pl-7">
                                <div className="flex items-center mb-2">
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                  <span className="text-green-700">Email verified</span>
                                </div>
                                {user.isAdmin && (
                                  <div className="flex items-center mb-2">
                                    <Check className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-green-700">Admin privileges</span>
                                  </div>
                                )}
                                {user.isModerator && (
                                  <div className="flex items-center mb-2">
                                    <Check className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-green-700">Moderator privileges</span>
                                  </div>
                                )}
                                {!user.isAdmin && !user.isModerator && (
                                  <div className="flex items-center mb-2">
                                    <Check className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="text-green-700">Regular user account</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
        
        {/* Cancel Booking Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <p className="text-sm">
                Cancellation policies may apply. You might not receive a full refund depending on the hotel's policy.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                Keep Booking
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelBooking}
              >
                Yes, Cancel Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
};

export default UserDashboard;
