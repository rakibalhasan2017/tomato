import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { Navbar } from '../components/Navbar';
import { LocationDetector } from '../components/LocationDetector';
import { NearbyRestaurants } from '../components/NearbyRestaurants';
import { useLocationDetection } from '../hooks/useLocationDetection';

export const Dashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    locationLabel,
    locationError,
    isLocating,
    locationGranted,
    coordinates,
    handleGetLocation,
  } = useLocationDetection();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-red-600 via-red-500 to-orange-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <p className="text-red-100 text-sm font-medium mb-1">Hey {user.name.split(' ')[0]} 👋</p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight">
            What would you like
            <br className="hidden sm:block" /> to eat today?
          </h2>
          <p className="text-red-100 text-sm mb-6">
            Discover restaurants near you and order in minutes
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-2 flex items-center gap-2 max-w-2xl mb-4">
            <div className="pl-3 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for restaurants or dishes..."
              className="flex-1 py-2.5 text-gray-800 bg-transparent focus:outline-none text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600 px-2"
              >
                ✕
              </button>
            )}
          </div>

          {/* Location Detector */}
          <LocationDetector
            locationLabel={locationLabel}
            locationError={locationError}
            isLocating={isLocating}
            locationGranted={locationGranted}
            onGetLocation={() => {
              void handleGetLocation();
            }}
          />
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Quick Links */}
        <section>
          <div className="grid grid-cols-3 gap-4">
            <Link
              to="/orders"
              className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center gap-2 hover:shadow-md hover:scale-[1.02] transition-all group text-center"
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl group-hover:bg-orange-200 transition">
                📦
              </div>
              <span className="text-sm font-semibold text-gray-700">My Orders</span>
              <span className="text-xs text-gray-400">Track your food</span>
            </Link>

            <Link
              to="/favourite-resturant"
              className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center gap-2 hover:shadow-md hover:scale-[1.02] transition-all group text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl group-hover:bg-red-200 transition">
                ❤️
              </div>
              <span className="text-sm font-semibold text-gray-700">Favourites</span>
              <span className="text-xs text-gray-400">Saved restaurants</span>
            </Link>

            <Link
              to="/account"
              className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center gap-2 hover:shadow-md hover:scale-[1.02] transition-all group text-center"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden group-hover:ring-2 ring-blue-300 transition">
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Account</span>
              <span className="text-xs text-gray-400">Profile & settings</span>
            </Link>
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="bg-gradient-to-r from-orange-400 to-yellow-400 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-white font-bold text-xl md:text-2xl leading-tight">
              50% off your
              <br />
              first order!
            </p>
            <p className="text-orange-100 text-sm mt-1 mb-4">
              Use code <span className="font-bold text-white">TOMATO50</span>
            </p>
            <button
              type="button"
              className="bg-white text-orange-500 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition shadow"
            >
              Order Now
            </button>
          </div>
          <div className="text-7xl md:text-8xl absolute right-6 opacity-30 select-none pointer-events-none">
            🍅
          </div>
        </section>

        {/* Nearby Restaurants */}
        <NearbyRestaurants
          coordinates={coordinates}
          searchTerm={searchTerm}
          onDetectLocation={() => {
            void handleGetLocation();
          }}
        />
      </main>
    </div>
  );
};

export default Dashboard;
