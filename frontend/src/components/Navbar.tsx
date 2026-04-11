import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

export const Navbar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-3 transition-transform hover:scale-105"
        >
          <span className="text-2xl">🍅</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            Tomato
          </h1>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-6">
          {/* Cart Icon */}
          <Link
            to="/cart"
            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all rounded-full relative group"
            title="Cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              0
            </span>
          </Link>

          {/* Person Icon / Account Link */}
          <Link
            to="/account"
            className="flex items-center gap-2 p-1 pl-1 pr-3 border border-transparent hover:border-red-100 hover:bg-red-50 rounded-full transition-all group"
          >
            <div className="w-8 h-8 rounded-full border-2 border-red-500 overflow-hidden">
              <img
                src={user.image || 'https://via.placeholder.com/40'}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 hidden sm:block">
              {user.name.split(' ')[0]}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
