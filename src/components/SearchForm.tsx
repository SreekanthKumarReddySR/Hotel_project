
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { SearchCriteria } from '@/types';
import { cn } from '@/lib/utils';

interface SearchFormProps {
  className?: string;
  minimal?: boolean;
}

const SearchForm = ({ className, minimal = false }: SearchFormProps) => {
  const navigate = useNavigate();
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    city: '',
    checkIn: null,
    checkOut: null,
    guests: 1,
  });

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCriteria({ ...searchCriteria, city: e.target.value });
  };

  const handleGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const guests = parseInt(e.target.value);
    if (guests > 0) {
      setSearchCriteria({ ...searchCriteria, guests });
    }
  };

  const handleDateSelect = (range: { from?: Date; to?: Date }) => {
    setDateRange({
      from: range.from,
      to: range.to
    });
    setSearchCriteria({
      ...searchCriteria,
      checkIn: range.from || null,
      checkOut: range.to || null,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCriteria.city) params.append('city', searchCriteria.city);
    if (searchCriteria.checkIn) params.append('checkIn', searchCriteria.checkIn.toISOString());
    if (searchCriteria.checkOut) params.append('checkOut', searchCriteria.checkOut.toISOString());
    params.append('guests', searchCriteria.guests.toString());

    navigate({
      pathname: '/hotels',
      search: params.toString(),
    });
  };

  return (
    <form onSubmit={handleSearch} className={cn("w-full", className)}>
      <div className={cn(
        "grid gap-4",
        minimal ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"
      )}>
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className={minimal ? "text-xs" : ""}>Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Where are you going?"
              className="pl-10"
              value={searchCriteria.city}
              onChange={handleCityChange}
              required
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className={minimal ? "text-xs" : ""}>Check-in & Check-out</Label>
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
                numberOfMonths={minimal ? 1 : 2}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className={cn("p-3 pointer-events-auto", minimal ? "rounded-md border" : "")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <Label htmlFor="guests" className={minimal ? "text-xs" : ""}>Guests</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="guests"
              type="number"
              min="1"
              placeholder="Number of guests"
              className="pl-10"
              value={searchCriteria.guests}
              onChange={handleGuestsChange}
            />
          </div>
        </div>

        {/* Search Button */}
        <div className={minimal ? "self-end" : "self-end md:self-end"}>
          <Button 
            type="submit" 
            className="w-full bg-hotel-500 hover:bg-hotel-600 text-white"
            size={minimal ? "default" : "lg"}
          >
            Search
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
