import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { Navbar } from '../components/Navbar';
import { getRestaurantById, getRestaurantMenuItems } from '../services/api';
import type { Restaurant, MenuItem } from '../services/api';
import { create } from 'zustand';

interface RestaurantMenuStore {
  restaurant: Restaurant | null;
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  setRestaurant: (r: Restaurant | null) => void;
  setMenuItems: (items: MenuItem[]) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

const useRestaurantMenuStore = create<RestaurantMenuStore>((set) => ({
  restaurant: null,
  menuItems: [],
  loading: false,
  error: null,
  setRestaurant: (restaurant) => set({ restaurant }),
  setMenuItems: (menuItems) => set({ menuItems }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ restaurant: null, menuItems: [], loading: false, error: null }),
}));

const formatDistance = (meters: number) =>
  meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;

export const RestaurantMenu = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const {
    restaurant,
    menuItems,
    loading,
    error,
    setRestaurant,
    setMenuItems,
    setLoading,
    setError,
    reset,
  } = useRestaurantMenuStore();

  useEffect(() => {
    if (!id || !token) return;
    reset();

    let isCancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [restaurantData, menuData] = await Promise.all([
          getRestaurantById(token, id),
          getRestaurantMenuItems(token, id),
        ]);
        if (!isCancelled) {
          setRestaurant(restaurantData);
          setMenuItems(menuData);
        }
      } catch (err) {
        if (!isCancelled)
          setError(err instanceof Error ? err.message : 'Failed to load restaurant');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      isCancelled = true;
    };
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 animate-pulse">
          <div className="h-56 bg-gray-200 rounded-2xl" />
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="h-36 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <span className="text-5xl block mb-4">😕</span>
          <p className="text-gray-700 font-semibold text-lg">{error}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  const availableItems = menuItems.filter((item) => item.isavailable);
  const unavailableItems = menuItems.filter((item) => !item.isavailable);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="relative h-56 sm:h-64 bg-gray-200 overflow-hidden">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl opacity-20">
            🍽️
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
          aria-label="Go back"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    restaurant.isopen ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  {restaurant.isopen ? 'Open' : 'Closed'}
                </span>
                {restaurant.isverified && (
                  <span className="bg-blue-500 text-white rounded-full p-0.5" title="Verified">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {restaurant.name}
              </h1>
              {restaurant.autolocation?.formattedAddress && (
                <p className="text-gray-300 text-xs mt-1 flex items-center gap-1">
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
            </div>
            {restaurant.distance !== undefined && (
              <span className="shrink-0 text-xs text-white bg-black/40 rounded-full px-3 py-1">
                {formatDistance(restaurant.distance)} away
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Info strip */}
        {(restaurant.description || restaurant.phonenumber) && (
          <div className="flex flex-wrap gap-4">
            {restaurant.description && (
              <p className="text-sm text-gray-600 flex-1 min-w-0">{restaurant.description}</p>
            )}
            {restaurant.phonenumber && (
              <a
                href={`tel:${restaurant.phonenumber}`}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-100 hover:border-red-200 transition shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {restaurant.phonenumber}
              </a>
            )}
          </div>
        )}

        {/* Menu */}
        {menuItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <span className="text-5xl block mb-3">🍽️</span>
            <p className="text-gray-700 font-semibold">No menu items yet</p>
            <p className="text-sm text-gray-400 mt-1">This restaurant hasn't added any items.</p>
          </div>
        ) : (
          <>
            {availableItems.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Menu</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {availableItems.map((item) => (
                    <MenuItemCard key={item._id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {unavailableItems.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-gray-400 mb-4">
                  Currently unavailable
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-60">
                  {unavailableItems.map((item) => (
                    <MenuItemCard key={item._id} item={item} unavailable />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const MenuItemCard = ({ item, unavailable }: { item: MenuItem; unavailable?: boolean }) => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
    <div className="h-36 bg-gray-100 relative overflow-hidden">
      {item.image ? (
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🍴</div>
      )}
      {unavailable && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-500 bg-white rounded-full px-3 py-1 shadow">
            Unavailable
          </span>
        </div>
      )}
    </div>
    <div className="p-4">
      <h4 className="font-bold text-gray-800 truncate">{item.name}</h4>
      {item.description && (
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
      )}
      <p className="mt-2 text-red-600 font-bold text-sm">${item.price.toFixed(2)}</p>
    </div>
  </div>
);

export default RestaurantMenu;
