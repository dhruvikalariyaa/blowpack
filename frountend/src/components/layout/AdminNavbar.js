import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  HomeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  UsersIcon,
  Squares2X2Icon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { logout } from '../../store/slices/authSlice';

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Orders', href: '/admin/orders', icon: ChartBarIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Categories', href: '/admin/categories', icon: Squares2X2Icon },
    { name: 'Reviews', href: '/admin/reviews', icon: ChatBubbleLeftRightIcon },
    { name: 'Contacts', href: '/admin/contacts', icon: EnvelopeIcon },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Same as main navbar */}
          <Link to="/" className="flex items-center group">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/logo.png" 
                alt="Blow Pack Plastic" 
                className="h-10 w-10 mr-1 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-blue-600 group-hover:text-blue-700 transition-colors leading-tight">
                  Blow Pack
                </h1>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Plastic Industries
                  </span>
                  <div className="h-0.5 w-16 bg-gradient-to-r from-blue-400 via-green-400 to-orange-400 rounded-full mt-1"></div>
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Admin Navigation - Same style as main navbar */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600'
                    } px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Admin User Menu */}
          <div className="flex items-center space-x-4">
            {/* Admin User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 p-2 transition-colors"
              >
                <UserIcon className="h-6 w-6" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Admin</p>
                    <p className="text-xs text-gray-500">admin@blowpack.com</p>
                  </div>
                  <Link
                    to="/"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <HomeIcon className="h-4 w-4 mr-3" />
                    View Website
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Admin Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  } block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
