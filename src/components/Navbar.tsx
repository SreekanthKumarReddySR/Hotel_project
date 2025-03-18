
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  Hotel, 
  Home, 
  Search,
  Calendar,
  Settings 
} from 'lucide-react';

const Navbar = () => {
  const { state, logout } = useAuth();
  const { isAuthenticated, user } = state;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Change navbar style when scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? 'bg-white/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-hotel-600 transition-opacity hover:opacity-80"
        >
          <Hotel className="h-6 w-6 md:h-8 md:w-8" />
          <span className="text-xl md:text-2xl font-semibold">StayHaven</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`text-sm font-medium btn-transition hover:text-hotel-500 ${
              location.pathname === '/' ? 'text-hotel-500' : 'text-foreground'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/hotels" 
            className={`text-sm font-medium btn-transition hover:text-hotel-500 ${
              location.pathname.startsWith('/hotels') ? 'text-hotel-500' : 'text-foreground'
            }`}
          >
            Hotels
          </Link>
          <Link 
            to="/pricing" 
            className={`text-sm font-medium btn-transition hover:text-hotel-500 ${
              location.pathname === '/pricing' ? 'text-hotel-500' : 'text-foreground'
            }`}
          >
            Pricing
          </Link>
          <Link 
            to="/about" 
            className={`text-sm font-medium btn-transition hover:text-hotel-500 ${
              location.pathname === '/about' ? 'text-hotel-500' : 'text-foreground'
            }`}
          >
            About
          </Link>
        </nav>

        {/* Authentication Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="btn-transition hover:text-hotel-500">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="btn-transition">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="btn-transition">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="default" size="sm" className="bg-hotel-500 hover:bg-hotel-600 btn-transition">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/80 backdrop-blur-md">
          <div className="container py-4 flex flex-col space-y-4 animate-fade-in-down">
            <Link
              to="/"
              className="flex items-center p-2 rounded-md hover:bg-hotel-50"
            >
              <Home className="h-4 w-4 mr-3 text-hotel-500" />
              <span>Home</span>
            </Link>
            <Link
              to="/hotels"
              className="flex items-center p-2 rounded-md hover:bg-hotel-50"
            >
              <Search className="h-4 w-4 mr-3 text-hotel-500" />
              <span>Hotels</span>
            </Link>
            <Link
              to="/pricing"
              className="flex items-center p-2 rounded-md hover:bg-hotel-50"
            >
              <Calendar className="h-4 w-4 mr-3 text-hotel-500" />
              <span>Pricing</span>
            </Link>
            <Link
              to="/about"
              className="flex items-center p-2 rounded-md hover:bg-hotel-50"
            >
              <Settings className="h-4 w-4 mr-3 text-hotel-500" />
              <span>About</span>
            </Link>

            <div className="pt-2 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center p-2 rounded-md hover:bg-hotel-50"
                  >
                    <User className="h-4 w-4 mr-3 text-hotel-500" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center p-2 rounded-md hover:bg-hotel-50 text-left"
                  >
                    <LogOut className="h-4 w-4 mr-3 text-hotel-500" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block p-2 rounded-md hover:bg-hotel-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block p-2 mt-2 text-center rounded-md bg-hotel-500 text-white hover:bg-hotel-600"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
