import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/auth-context';
import { useRestaurant } from '../context/restaurant-context';
import { Navbar } from '../components/Navbar';
import { getBrowserLocation, reverseGeocode } from '../services/geolocation';
import {
  getMyRestaurant,
  createRestaurant as apiCreateRestaurant,
  updateRestaurant as apiUpdateRestaurant,
} from '../services/api';

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

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [formattedAddress, setFormattedAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

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

  // Set initial form states when restaurant is loaded
  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setDescription(restaurant.description || '');
      setPhonenumber(restaurant.phonenumber);
      if (restaurant.autolocation?.coordinates) {
        setLongitude(restaurant.autolocation.coordinates[0]);
        setLatitude(restaurant.autolocation.coordinates[1]);
      }
      setFormattedAddress(restaurant.autolocation?.formattedAddress || '');
      setImagePreview(restaurant.image);
    } else {
      // Reset form if no restaurant
      setName('');
      setDescription('');
      setPhonenumber('');
      setLatitude('');
      setLongitude('');
      setFormattedAddress('');
      setImagePreview(null);
      setImageFile(null);
    }
  }, [restaurant]);

  // Handle Location Detection
  const handleAutoDetectLocation = async () => {
    setIsLocating(true);
    setActionError(null);
    try {
      const location = await getBrowserLocation();
      setLatitude(location.latitude);
      setLongitude(location.longitude);
      
      const address = await reverseGeocode(location.latitude, location.longitude);
      if (address) {
        setFormattedAddress(address);
      } else {
        setFormattedAddress(`Coordinates: ${location.latitude}, ${location.longitude}`);
      }
      setSuccessMessage('Location detected successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to detect location.');
    } finally {
      setIsLocating(false);
    }
  };

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

  // Submit Handler (Create/Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setActionError(null);
    setSuccessMessage(null);

    // Validations
    if (!name.trim() || !phonenumber.trim() || !formattedAddress.trim() || latitude === '' || longitude === '') {
      setActionError('Please fill out all required fields.');
      return;
    }

    if (!restaurant && !imageFile) {
      setActionError('Please upload a cover image for your restaurant.');
      return;
    }

    setRestaurantLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('phonenumber', phonenumber);
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
      formData.append('formattedAddress', formattedAddress);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (restaurant) {
        formData.append('imageUrl', restaurant.image);
      }

      if (restaurant) {
        formData.append('status', String(restaurant.isopen));
        const updated = await apiUpdateRestaurant(token, formData);
        updateRestaurant(updated);
        setSuccessMessage('Restaurant updated successfully.');
      } else {
        const created = await apiCreateRestaurant(token, formData);
        updateRestaurant(created);
        setSuccessMessage('Restaurant created successfully.');
      }
      setIsEditing(false);
    } catch (err: any) {
      setActionError(err.message || 'Failed to save restaurant.');
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
                    className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all hover:scale-105 ${
                      restaurant.isopen
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Information Card */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                      About Us
                    </h3>
                    <p className="mt-2 text-gray-700 leading-relaxed">
                      {restaurant.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                      Contact Number
                    </h3>
                    <p className="mt-2 text-gray-700 font-medium">{restaurant.phonenumber}</p>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div className="space-y-4">
                  <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100/50">
                    <span className="text-2xl">📈</span>
                    <h4 className="text-sm font-semibold text-orange-800 mt-2">Active Store</h4>
                    <p className="text-xs text-orange-600 mt-1">
                      Ready to manage and process customer orders.
                    </p>
                  </div>
                  <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100/50">
                    <span className="text-2xl">🍔</span>
                    <h4 className="text-sm font-semibold text-red-800 mt-2">Menu Items</h4>
                    <p className="text-xs text-red-600 mt-1">
                      Add, remove, and manage dishes inside your store.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Create / Edit Form Mode */
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 px-8 py-8 text-white">
              <h1 className="text-3xl font-black">
                {restaurant ? 'Edit Restaurant Profile' : 'Register Your Restaurant'}
              </h1>
              <p className="mt-2 text-red-50 text-sm">
                Provide details about your store to connect with hungry customers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Cover Image & Description */}
                <div className="space-y-6">
                  {/* Cover Image Upload */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Cover Image <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-red-400 transition-all bg-gray-50/50 overflow-hidden flex flex-col justify-center items-center min-h-[220px]">
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-cover rounded-xl"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow pointer-events-none">
                              Change Image
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2 pointer-events-none">
                          <span className="text-4xl block">🖼️</span>
                          <span className="text-xs font-semibold text-gray-500">
                            Upload a JPEG or PNG cover photo
                          </span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell customers about your kitchen, specialties, and hours..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition"
                    />
                  </div>
                </div>

                {/* Right Column: Name, Phone, Location */}
                <div className="space-y-6">
                  {/* Restaurant Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Restaurant Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Bella Italia"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phonenumber}
                      onChange={(e) => setPhonenumber(e.target.value)}
                      placeholder="e.g. +1 555-0199"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition"
                    />
                  </div>

                  {/* Location Area */}
                  <div className="border-t border-gray-100 pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-bold text-gray-700">
                        Store Location <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoDetectLocation}
                        disabled={isLocating}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        📍 {isLocating ? 'Detecting...' : 'Auto-detect Location'}
                      </button>
                    </div>

                    {/* Coordinates Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                          Latitude
                        </span>
                        <input
                          type="number"
                          step="any"
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value !== '' ? Number(e.target.value) : '')}
                          placeholder="e.g. 40.7128"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition bg-gray-50/50"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                          Longitude
                        </span>
                        <input
                          type="number"
                          step="any"
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value !== '' ? Number(e.target.value) : '')}
                          placeholder="e.g. -74.0060"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition bg-gray-50/50"
                        />
                      </div>
                    </div>

                    {/* Formatted Address */}
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Formatted Address
                      </span>
                      <input
                        type="text"
                        value={formattedAddress}
                        onChange={(e) => setFormattedAddress(e.target.value)}
                        placeholder="e.g. 123 Main St, New York, NY"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Controls */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-6 mt-8">
                {restaurant && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setActionError(null);
                    }}
                    className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading || isLocating}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-semibold transition shadow-md disabled:opacity-60"
                >
                  {isLoading ? 'Saving...' : restaurant ? 'Save Changes' : 'Register Restaurant'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default RestaurantPage;
