import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, X, User as UserIcon, LogOut, LayoutDashboard, 
  CalendarDays, ShoppingBag, BookOpen, Bell, Briefcase, 
  MailPlus, Users, ChevronDown 
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Define links based on roles
  const getNavLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'customer':
        return [
          { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
          { name: 'Events', path: '/customer/events', icon: CalendarDays },
          { name: 'Marketplace', path: '/customer/marketplace', icon: ShoppingBag },
          { name: 'Bookings', path: '/customer/bookings', icon: BookOpen },
          { name: 'Notifications', path: '/customer/notifications', icon: Bell },
        ];
      case 'vendor':
        return [
          { name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
          { name: 'My Services', path: '/vendor/services', icon: Briefcase },
          { name: 'Bookings', path: '/vendor/bookings', icon: BookOpen },
          { name: 'Invitations', path: '/vendor/invitations', icon: MailPlus },
          { name: 'Notifications', path: '/vendor/notifications', icon: Bell },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Bookings', path: '/admin/bookings', icon: BookOpen },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group" onClick={closeMobileMenu}>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
                E
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                EventManager
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {user && (
            <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </NavLink>
                );
              })}
            </div>
          )}

          {/* Right Section: User Profile or Login/Register */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative ml-3" ref={dropdownRef}>
                <div>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-1 hover:bg-gray-50 transition-colors"
                  >
                    {user.avatar ? (
                      <img className="h-8 w-8 rounded-full object-cover border border-gray-200" src={user.avatar} alt={user.name} />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">{user.name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500 hidden lg:block" />
                  </button>
                </div>

                {isDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100 lg:hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      Your Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm hover:shadow active:scale-95">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-in slide-in-from-top-2 duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </NavLink>
                );
              })
            ) : (
              <div className="flex flex-col space-y-2 pt-2 pb-4">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 rounded-md text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700 text-center"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
          
          {user && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5 mb-3">
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt={user.name} />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium leading-none text-gray-500 mt-1">{user.email}</div>
                </div>
              </div>
              <div className="px-2 space-y-1">
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                >
                  <UserIcon className="w-5 h-5" />
                  Your Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
