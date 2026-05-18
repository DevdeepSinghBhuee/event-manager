import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`relative text-sm font-medium transition-colors duration-200 pb-0.5
        ${isActive(to)
          ? 'text-indigo-600'
          : 'text-slate-600 hover:text-indigo-600'
        }`}
    >
      {label}
      {isActive(to) && (
        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md group-hover:shadow-indigo-200 transition-shadow">
            <span className="text-white text-sm">🎉</span>
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">
            Event<span className="text-indigo-600">Manager</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          {!user ? (
            <>
              {navLink('/login', 'Sign In')}
              <Link
                to="/register"
                className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-200 hover:shadow-md"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              {user.role === 'customer' && (
                <>
                  {navLink('/events', 'My Events')}
                  {navLink('/marketplace', 'Marketplace')}
                  {navLink('/bookings', 'Bookings')}
                </>
              )}
              {user.role === 'vendor' && (
                <>
                  {navLink('/vendor/dashboard', 'Dashboard')}
                  {navLink('/vendor/bookings', 'Bookings')}
                  {navLink('/vendor/invitations', 'Invitations')}
                </>
              )}
              {user.role === 'admin' && (
                navLink('/admin/dashboard', 'Admin Panel')
              )}

              {/* Profile dropdown area */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-indigo-200 transition-shadow">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                    {user.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;