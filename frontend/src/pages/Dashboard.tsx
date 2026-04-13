import { useEffect, useState } from 'react';
import { useAuth } from '../context/auth-context';
import { Navbar } from '../components/Navbar';
import { getBrowserLocation, reverseGeocode } from '../services/geolocation';
import { updateCurrentLocation } from '../services/api';
import type { BrowserLocationError } from '../services/geolocation';

export const Dashboard = () => {
  const { user, token, currentLocation, setCurrentLocation } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState('Location not detected yet');

  const formatCoordinateFallback = (latitude: number, longitude: number) =>
    `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`;

  useEffect(() => {
    let isCancelled = false;

    const resolveLocationLabel = async () => {
      if (currentLocation?.permission === 'denied') {
        setLocationLabel('Location access was denied');
        return;
      }

      if (currentLocation?.permission === 'unavailable') {
        setLocationLabel('Location is unavailable right now');
        return;
      }

      if (currentLocation?.permission === 'granted' && currentLocation.point?.coordinates) {
        const [longitude, latitude] = currentLocation.point.coordinates;
        setLocationLabel('Resolving location address...');

        const address = await reverseGeocode(latitude, longitude);

        if (!isCancelled) {
          setLocationLabel(address ?? formatCoordinateFallback(latitude, longitude));
        }
        return;
      }
      setLocationLabel('Location not detected yet');
    };
    void resolveLocationLabel();
    return () => {
      isCancelled = true;
    };
  }, [currentLocation]);

  const handleGetLocation = async () => {
    if (!token) {
      setLocationError('You are not authenticated. Please sign in again.');
      return;
    }
    setLocationError(null);
    setIsLocating(true);
    setLocationLabel('Detecting your location...');
    try {
      const browserLocation = await getBrowserLocation();
      const response = await updateCurrentLocation(token, {
        latitude: browserLocation.latitude,
        longitude: browserLocation.longitude,
        accuracyMeters: browserLocation.accuracyMeters,
        capturedAt: browserLocation.capturedAt,
        permission: 'granted',
      });

      setCurrentLocation(response.currentLocation);

      if (response.currentLocation?.point?.coordinates) {
        const [longitude, latitude] = response.currentLocation.point.coordinates;
        setLocationLabel('Resolving location address...');
        const address = await reverseGeocode(latitude, longitude);
        setLocationLabel(address ?? formatCoordinateFallback(latitude, longitude));
      } else {
        setLocationLabel('Location detected successfully');
      }
    } catch (error) {
      const locationError = error as BrowserLocationError;
      const permission = locationError.code === 'permission_denied' ? 'denied' : 'unavailable';
      await updateCurrentLocation(token, { permission });
      setCurrentLocation(null);
      setLocationLabel(
        permission === 'denied'
          ? 'Location access was denied'
          : 'Location is unavailable right now',
      );
      setLocationError(
        locationError?.message
          ? locationError.message
          : 'Unable to fetch location. Please try again.',
      );
    } finally {
      setIsLocating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-6">
            <img
              src={user.image}
              alt={user.name}
              className="w-20 h-20 rounded-full border-4 border-red-500"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user.name}!</h2>
              <p className="text-gray-500">{user.email}</p>
              {user.role && (
                <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium capitalize">
                  {user.role}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Find Restaurants</h3>
        {locationError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {locationError}
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search restaurants..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300"
            />
            <button
              type="button"
              onClick={() => {
                void handleGetLocation();
              }}
              disabled={isLocating}
              className="px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLocating ? 'Getting location...' : 'Get Location'}
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Current Location
            </p>
            <p className="text-sm text-gray-700">{locationLabel}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
