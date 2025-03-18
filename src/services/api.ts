import axios from 'axios';
import { Hotel, Room, User, Booking, SearchCriteria } from '@/types';

// Create an axios instance with the base URL
const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add a request interceptor to add the authorization token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
const handleApiError = (error: any) => {
  if (error.code === 'ERR_NETWORK') {
    console.error('Network error: Cannot connect to the backend server');
    return { 
      error: true,
      message: 'Cannot connect to the server. Please ensure the backend server is running at ' + API_URL
    };
  }
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return { 
      error: true,
      message: error.response.data?.message || 'Server error',
      status: error.response.status
    };
  } else if (error.request) {
    // The request was made but no response was received
    return { 
      error: true,
      message: 'No response from server. Please try again later.',
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return { 
      error: true,
      message: error.message || 'An unknown error occurred',
    };
  }
};

// Authentication
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  register: async (userData: Partial<User>) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Hotels
export const hotelAPI = {
  getAllHotels: async () => {
    try {
      const response = await api.get('/hotels');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getHotelById: async (id: string) => {
    const response = await api.get(`/hotels/${id}`);
    return response.data;
  },
  searchHotels: async (criteria: SearchCriteria) => {
    const response = await api.post('/hotels/search', criteria);
    return response.data;
  },
  getFeaturedHotels: async () => {
    const response = await api.get('/hotels/featured');
    return response.data;
  },
  createHotel: async (hotelData: Partial<Hotel>) => {
    const response = await api.post('/hotels', hotelData);
    return response.data;
  },
  updateHotel: async (id: string, hotelData: Partial<Hotel>) => {
    const response = await api.put(`/hotels/${id}`, hotelData);
    return response.data;
  },
  deleteHotel: async (id: string) => {
    const response = await api.delete(`/hotels/${id}`);
    return response.data;
  },
};

// Rooms
export const roomAPI = {
  getRoomsForHotel: async (hotelId: string) => {
    const response = await api.get(`/rooms/hotel/${hotelId}`);
    return response.data;
  },
  getRoomById: async (id: string) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },
  createRoom: async (hotelId: string, roomData: Partial<Room>) => {
    const response = await api.post(`/rooms/${hotelId}`, roomData);
    return response.data;
  },
  updateRoom: async (id: string, roomData: Partial<Room>) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },
  deleteRoom: async (id: string, hotelId: string) => {
    const response = await api.delete(`/rooms/${id}/${hotelId}`);
    return response.data;
  },
  checkRoomAvailability: async (roomId: string, dateStart: Date, dateEnd: Date) => {
    const response = await api.get(`/rooms/availability/${roomId}`, {
      params: { dateStart, dateEnd },
    });
    return response.data;
  },
};

// Bookings
export const bookingAPI = {
  getUserBookings: async (userId: string) => {
    const response = await api.get(`/bookings/user/${userId}`);
    return response.data;
  },
  createBooking: async (bookingData: Partial<Booking>) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  cancelBooking: async (id: string) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },
  getAllBookings: async (hotelId?: string) => {
    const url = hotelId ? `/bookings/hotel/${hotelId}` : '/bookings';
    const response = await api.get(url);
    return response.data;
  },
};

// Users
export const userAPI = {
  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
};

// Check if the backend is available
export const checkBackendConnection = async () => {
  try {
    await api.get('/health-check', { timeout: 3000 });
    return true;
  } catch (error) {
    console.error('Backend connection check failed:', error);
    return false;
  }
};

export default api;
