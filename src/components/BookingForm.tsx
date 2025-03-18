import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInCalendarDays } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Room, Hotel } from '@/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CreditCard, User, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { bookingAPI } from '@/services/api';

interface BookingFormProps {
  hotel: Hotel;
  room: Room;
  roomNumber: number;
  checkIn: Date | null;
  checkOut: Date | null;
  onClose: () => void;
}

const BookingForm = ({ hotel, room, roomNumber, checkIn, checkOut, onClose }: BookingFormProps) => {
  const { state } = useAuth();
  const { user } = state;
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: checkIn || undefined,
    to: checkOut || undefined,
  });

  // Calculate total price when dates change
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const nights = differenceInCalendarDays(dateRange.to, dateRange.from);
      setTotalPrice(room.price * nights);
    } else {
      setTotalPrice(0);
    }
  }, [dateRange, room.price]);

  const handleDateSelect = (range: { from?: Date; to?: Date }) => {
    setDateRange({
      from: range.from,
      to: range.to
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?._id) {
      toast.error("You must be logged in to book a room");
      return;
    }
    
    if (!dateRange.from || !dateRange.to) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create booking
      const bookingData = {
        userId: user._id,
        hotelId: hotel._id,
        roomId: room._id,
        roomNumber: roomNumber,
        dateStart: dateRange.from,
        dateEnd: dateRange.to,
        totalPrice: totalPrice,
        status: 'confirmed' as const,
      };
      
      const response = await bookingAPI.createBooking(bookingData);
      
      toast.success("Room booked successfully!");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to book room");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-5 text-center">
        <p className="mb-4">Please login to book this room</p>
        <Button onClick={() => navigate('/login')} className="bg-hotel-500 hover:bg-hotel-600">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-5">
      <h3 className="text-lg font-semibold">Complete Your Booking</h3>
      
      <div className="space-y-4">
        {/* Guest Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Guest Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={user.username}
                readOnly
                className="w-full rounded-md border border-input bg-muted px-3 py-2 pl-10 text-sm"
              />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full rounded-md border border-input bg-muted px-3 py-2 pl-10 text-sm"
              />
            </div>
            
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={user.phone || "Not provided"}
                readOnly
                className="w-full rounded-md border border-input bg-muted px-3 py-2 pl-10 text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Booking Details */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Booking Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm mb-1">Hotel</p>
              <p className="font-medium">{hotel.name}</p>
            </div>
            
            <div>
              <p className="text-sm mb-1">Room</p>
              <p className="font-medium">{room.title} (Room {roomNumber})</p>
            </div>
            
            <div className="md:col-span-2">
              <p className="text-sm mb-1">Stay Dates</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d, yyyy")} -{" "}
                          {format(dateRange.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      "Select dates"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={handleDateSelect}
                    numberOfMonths={2}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        {/* Payment Summary */}
        <div className="space-y-3 rounded-lg bg-gray-50 p-4">
          <h4 className="font-medium">Payment Summary</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Room rate:</span>
              <span>${room.price} per night</span>
            </div>
            
            {dateRange.from && dateRange.to && (
              <div className="flex justify-between text-sm">
                <span>Stay duration:</span>
                <span>{differenceInCalendarDays(dateRange.to, dateRange.from)} nights</span>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        
        <Button 
          type="submit"
          className="bg-hotel-500 hover:bg-hotel-600"
          disabled={isSubmitting || !dateRange.from || !dateRange.to || totalPrice === 0}
        >
          {isSubmitting ? "Processing..." : "Confirm Booking"}
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;
