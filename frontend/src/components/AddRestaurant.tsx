import React, { useState } from 'react';
import { useRestaurant } from '../context/restaurant-context';
import { getBrowserLocation, reverseGeocode } from '../services/geolocation';
import { createRestaurant as apiCreateRestaurant } from '../services/api';

interface AddRestaurantProps {
  token: string;
  onSuccess: (message: string | null) => void;
  onError: (message: string | null) => void;
}

export const AddRestaurant: React.FC<AddRestaurantProps> = ({ token, onSuccess, onError }) => {
  const {
    restaurantLoading: isLoading,
    updateRestaurant,
    setRestaurantLoading,
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
  const [isLocating, setIsLocating] = useState(false);

  // Handle Location Detection
  const handleAutoDetectLocation = async () => {
    setIsLocating(true);
    onError(null);
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
      onSuccess('Location detected successfully.');
      setTimeout(() => onSuccess(null), 3000);
    } catch (err: any) {
      onError(err?.message || 'Failed to detect location.');
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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    onError(null);
    onSuccess(null);

    // Validations
    if (!name.trim() || !phonenumber.trim() || !formattedAddress.trim() || latitude === '' || longitude === '') {
      onError('Please fill out all required fields.');
      return;
    }

    if (!imageFile) {
      onError('Please upload a cover image for your restaurant.');
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
      formData.append('image', imageFile);

      const created = await apiCreateRestaurant(token, formData);
      updateRestaurant(created);
      onSuccess('Restaurant created successfully.');
    } catch (err: any) {
      onError(err.message || 'Failed to save restaurant.');
    } finally {
      setRestaurantLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 px-8 py-8 text-white">
        <h1 className="text-3xl font-black">Register Your Restaurant</h1>
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
          <button
            type="submit"
            disabled={isLoading || isLocating}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-semibold transition shadow-md disabled:opacity-60"
          >
            {isLoading ? 'Saving...' : 'Register Restaurant'}
          </button>
        </div>
      </form>
    </div>
  );
};
