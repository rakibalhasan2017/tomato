import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { useNearbyRestaurants } from '../context/nearby-restaurants-context';
import { getNearbyRestaurants } from '../services/api';
import type { Coordinates } from '../hooks/useLocationDetection';

interface NearbyRestaurantsProps {
  coordinates: Coordinates | null;
  searchTerm: string;
  onDetectLocation: () => void;
}

const formatDistance = (meters: number) =>
  meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;

export const NearbyRestaurants = ({
  coordinates,
  searchTerm,
  onDetectLocation,
}: NearbyRestaurantsProps) => {
  const { token } = useAuth();
  const { restaurants, loading, error, setRestaurants, setLoading, setError } =
    useNearbyRestaurants();

  useEffect(() => {
    if (!coordinates || !token) return;

    let isCancelled = false;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getNearbyRestaurants(token, coordinates.latitude, coordinates.longitude);
        if (!isCancelled) setRestaurants(data);
      } catch (err) {
        if (!isCancelled)
          setError(err instanceof Error ? err.message : 'Failed to load restaurants');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    void fetch();
    return () => {
      isCancelled = true;
    };
  }, [coordinates]);

  const filtered = restaurants.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      r.name.toLowerCase().includes(term) ||
      r.description?.toLowerCase().includes(term);
    return matchesSearch;
  });

  const sectionTitle = searchTerm ? `Results for "${searchTerm}"` : 'Restaurants near you';

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">{sectionTitle}</h3>
        {restaurants.length > 0 && (
          <span className="text-sm text-gray-400">{filtered.length} found</span>
        )}
      </div>

      {/* No location prompt */}
      {!coordinates && !loading && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-sm text-amber-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mt-0.5 shrink-0 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z"
            />
          </svg>
          <p>
            Enable your location to see restaurants near you.{' '}
            <button
              type="button"
              onClick={onDetectLocation}
              className="underline font-semibold hover:text-amber-900"
            >
              Detect location
            </button>
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-4 text-sm text-red-700 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && coordinates && filtered.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <span className="text-5xl block mb-3">🍽️</span>
          <p className="text-gray-700 font-semibold">No restaurants found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm
              ? 'Try a different search or category'
              : 'No restaurants are available within 5 km of your location'}
          </p>
        </div>
      )}

      {/* Restaurant Cards */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((restaurant) => (
            <Link
              key={restaurant._id}
              to={`/restaurant/${restaurant._id}`}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer group block"
            >
              {/* Image */}
              <div className="h-40 bg-gray-100 relative overflow-hidden">
                {restaurant.image ? (
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl opacity-30">🍽️</span>
                  </div>
                )}
                <span
                  className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow ${
                    restaurant.isopen ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  {restaurant.isopen ? 'Open' : 'Closed'}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-800 truncate group-hover:text-red-600 transition">
                      {restaurant.name}
                    </h4>
                    {restaurant.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {restaurant.description}
                      </p>
                    )}
                  </div>
                  {restaurant.isverified && (
                    <span title="Verified" className="shrink-0 text-blue-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>

                {restaurant.autolocation?.formattedAddress && (
                  <p className="mt-1.5 text-xs text-gray-400 truncate flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {restaurant.autolocation.formattedAddress}
                  </p>
                )}

                {restaurant.distance !== undefined && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    {formatDistance(restaurant.distance)} away
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
