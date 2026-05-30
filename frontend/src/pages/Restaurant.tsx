import { useEffect, useState } from 'react';
import { useAuth } from '../context/auth-context';
import { useRestaurant } from '../context/restaurant-context';
import { Navbar } from '../components/Navbar';
import { AddRestaurant } from '../components/AddRestaurant';
import { UpdateRestaurant } from '../components/UpdateRestaurant';
import { AddMenuItem } from '../components/AddMenuItem';
import { ViewMenu } from '../components/ViewMenu';
import { MenuSalesStats } from '../components/MenuSalesStats';
import { getMyRestaurant, updateRestaurant as apiUpdateRestaurant } from '../services/api';

export const RestaurantPage = () => {
  const { token, user } = useAuth();
  const {
    restaurant,
    restaurantLoading: isLoading,
    restaurantError: storeError,
    updateRestaurant,
    setRestaurantLoading,
    setRestaurantError,
  } = useRestaurant();

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'stats'>('view');

  // Fetch restaurant helper
  const fetchRestaurantData = async (authToken: string) => {
    setRestaurantLoading(true);
    setRestaurantError(null);
    try {
      const data = await getMyRestaurant(authToken);
      updateRestaurant(data);
    } catch (err: any) {
      // 404 means this seller doesn't have a restaurant yet, which is fine.
      if (err.message && err.message.includes('404')) {
        updateRestaurant(null);
      } else {
        setRestaurantError(err.message || 'Failed to fetch restaurant');
      }
    } finally {
      setRestaurantLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      void fetchRestaurantData(token);
    }
  }, [token]);

  // Toggle Restaurant Open/Closed Status
  const handleStatusToggle = async () => {
    if (!token || !restaurant) return;
    setActionError(null);
    setRestaurantLoading(true);
    try {
      const formData = new FormData();
      formData.append('status', String(!restaurant.isopen));
      formData.append('name', restaurant.name);
      formData.append('phonenumber', restaurant.phonenumber);

      const updated = await apiUpdateRestaurant(token, formData);
      updateRestaurant(updated);
      setSuccessMessage(`Restaurant is now ${!restaurant.isopen ? 'Open' : 'Closed'}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update restaurant status.');
    } finally {
      setRestaurantLoading(false);
    }
  };

  if (!user || user.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-red-100">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Access Denied</h2>
          <p className="text-gray-500 mt-2">
            Only sellers can access the restaurant management portal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Alerts */}
        {(storeError || actionError) && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm animate-fade-in">
            <div className="flex gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <h4 className="font-semibold">Something went wrong</h4>
                <p className="text-sm mt-1">{actionError || storeError}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700 shadow-sm animate-fade-in">
            <div className="flex gap-3">
              <span className="text-lg">✨</span>
              <p className="text-sm font-semibold">{successMessage}</p>
            </div>
          </div>
        )}

        {isLoading && !restaurant && !isEditing ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4 font-medium">Fetching restaurant information...</p>
          </div>
        ) : restaurant && !isEditing ? (
          /* Profile Mode */
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Cover Image Header */}
            <div className="h-64 relative bg-gray-200">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end text-white">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black">{restaurant.name}</h1>
                    {restaurant.isverified && (
                      <span
                        className="bg-blue-500 text-white rounded-full p-1"
                        title="Verified Restaurant"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a.75.75 0 00-.708.522L4.08 9H1.75a.75.75 0 000 1.5h2.812c.21 0 .402-.122.487-.315l1.095-2.464 1.704 6.819a.75.75 0 001.442-.047l2.12-5.748 1.11 2.22a.75.75 0 001.341-.014l1.83-3.66h2.509a.75.75 0 000-1.5h-2.93a.75.75 0 00-.67.418l-1.127 2.254-2.185-5.91a.75.75 0 00-1.423-.047L7.697 10.38l-1.43-5.72A.75.75 0 006.268 3.455z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-200 mt-1 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {restaurant.autolocation?.formattedAddress}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleStatusToggle}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all hover:scale-105 ${restaurant.isopen
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                  >
                    {restaurant.isopen ? '● Open' : '○ Closed'}
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-800 text-sm font-bold shadow-md transition-all hover:scale-105"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* About Us */}
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>📖</span> About Us
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {restaurant.description || 'No description provided.'}
                  </p>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>📞</span> Contact Information
                  </h3>
                  <div className="flex items-center gap-3 text-gray-700 font-medium bg-white p-3 rounded-xl border border-gray-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {restaurant.phonenumber}
                  </div>
                </div>
              </div>

              {/* Menu Management Tabs */}
              <div className="mt-8 border-t border-gray-100 pt-8">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('view')}
                    className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === 'view'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    View Menu
                  </button>
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === 'edit'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Add Menu
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === 'stats'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Sales Statistics
                  </button>
                </div>

                <div className="mt-6">
                  {activeTab === 'view' && (
                    <ViewMenu
                      token={token || ''}
                      onSuccess={setSuccessMessage}
                      onError={setActionError}
                    />
                  )}
                  {activeTab === 'edit' && (
                    <AddMenuItem
                      token={token || ''}
                      onSuccess={setSuccessMessage}
                      onError={setActionError}
                    />
                  )}
                  {activeTab === 'stats' && <MenuSalesStats token={token || ''} />}
                </div>
              </div>
            </div>
          </div>
        ) : restaurant && isEditing ? (
          <UpdateRestaurant
            token={token || ''}
            onSuccess={setSuccessMessage}
            onError={setActionError}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <AddRestaurant
            token={token || ''}
            onSuccess={setSuccessMessage}
            onError={setActionError}
          />
        )}
      </main>
    </div>
  );
};

export default RestaurantPage;
