
import { useState } from 'react';
import { Room } from '@/types';
import { Users, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface RoomCardProps {
  room: Room;
  hotelId: string;
  checkIn?: Date | null;
  checkOut?: Date | null;
  onBookRoom: (room: Room, roomNumber: number) => void;
  className?: string;
}

const RoomCard = ({ 
  room, 
  hotelId, 
  checkIn, 
  checkOut, 
  onBookRoom, 
  className 
}: RoomCardProps) => {
  const { state } = useAuth();
  const { isAuthenticated } = state;
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<number | null>(null);

  const isRoomNumberAvailable = (roomNumber: number) => {
    if (!checkIn || !checkOut) return true;
    
    const roomNumberData = room.roomNumbers.find(r => r.number === roomNumber);
    if (!roomNumberData) return false;

    return !roomNumberData.unavailableDates.some(date => {
      const d = new Date(date);
      return d >= checkIn && d <= checkOut;
    });
  };

  const handleSelectRoom = (roomNumber: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to book a room");
      return;
    }
    
    if (!isRoomNumberAvailable(roomNumber)) {
      toast.error("This room is not available for the selected dates");
      return;
    }
    
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    
    setSelectedRoomNumber(roomNumber);
  };

  const handleBookRoom = () => {
    if (selectedRoomNumber !== null) {
      onBookRoom(room, selectedRoomNumber);
    }
  };

  return (
    <div className={cn(
      "border border-border rounded-lg overflow-hidden bg-white hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Room Details */}
        <div className="p-5 md:col-span-8 space-y-4">
          <h3 className="text-xl font-semibold">{room.title}</h3>
          
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>Max {room.maxPeople} {room.maxPeople === 1 ? 'person' : 'people'}</span>
          </div>
          
          <p className="text-sm text-muted-foreground">{room.desc}</p>
          
          {/* Room Numbers */}
          {checkIn && checkOut && (
            <div className="pt-3">
              <p className="text-sm font-medium mb-2">Select a room number:</p>
              <div className="flex flex-wrap gap-2">
                {room.roomNumbers.map((roomNumber) => {
                  const isAvailable = isRoomNumberAvailable(roomNumber.number);
                  return (
                    <button
                      key={roomNumber.number}
                      onClick={() => handleSelectRoom(roomNumber.number)}
                      disabled={!isAvailable}
                      className={cn(
                        "h-8 w-8 rounded-md flex items-center justify-center text-sm border transition-colors",
                        isAvailable
                          ? "border-hotel-200 hover:border-hotel-500 hover:bg-hotel-50"
                          : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed",
                        selectedRoomNumber === roomNumber.number && "bg-hotel-500 text-white border-hotel-500"
                      )}
                    >
                      {roomNumber.number}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Room Amenities */}
          <div className="pt-3 grid grid-cols-2 gap-2">
            <div className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Free Wi-Fi</span>
            </div>
            <div className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Air conditioning</span>
            </div>
            <div className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Flat-screen TV</span>
            </div>
            <div className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Private bathroom</span>
            </div>
          </div>
        </div>
        
        {/* Pricing and Booking */}
        <div className="bg-gray-50 p-5 md:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-2xl font-bold">${room.price}</span>
              <span className="text-muted-foreground text-sm">per night</span>
            </div>
            
            {!checkIn || !checkOut ? (
              <p className="text-sm text-muted-foreground mb-4">
                Select dates to check availability
              </p>
            ) : (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  {room.roomNumbers.some(r => isRoomNumberAvailable(r.number)) ? (
                    <span className="text-green-600 font-medium">Available</span>
                  ) : (
                    <span className="text-red-600 font-medium">Unavailable</span>
                  )}
                </div>
                
                {selectedRoomNumber && (
                  <div className="flex justify-between text-sm">
                    <span>Selected Room:</span>
                    <span className="font-medium">Room {selectedRoomNumber}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Button
            onClick={handleBookRoom}
            disabled={!selectedRoomNumber || !checkIn || !checkOut || !isAuthenticated}
            className="mt-4 w-full bg-hotel-500 hover:bg-hotel-600"
          >
            {!isAuthenticated
              ? "Login to Book"
              : !checkIn || !checkOut
              ? "Select Dates First"
              : !selectedRoomNumber
              ? "Select a Room"
              : "Book Now"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
