import React, { useEffect, useState } from 'react';
import { useMenu } from '../context/menu-context';
import { updateMenuItem as apiUpdateMenuItem } from '../services/api';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  isAvailable: boolean;
}

interface UpdateMenuItemProps {
  token: string;
  menuItem: MenuItem;
  onSuccess?: (message: string | null) => void;
  onError?: (message: string | null) => void;
  onCancel: () => void;
}

export const UpdateMenuItem: React.FC<UpdateMenuItemProps> = ({
  token,
  menuItem,
  onSuccess,
  onError,
  onCancel,
}) => {
  const { updateMenuItem } = useMenu();
  const [name, setName] = useState(menuItem.name);
  const [price, setPrice] = useState<number | ''>(menuItem.price);
  const [description, setDescription] = useState(menuItem.description);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(menuItem.image);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(menuItem.name);
    setPrice(menuItem.price);
    setDescription(menuItem.description);
    setImagePreview(menuItem.image);
    setImageFile(null);
  }, [menuItem]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsLoading(true);
    if (onError) onError(null);
    if (onSuccess) onSuccess(null);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', String(price));
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }
      formData.append('isavailable', String(menuItem.isAvailable));

      const updatedRaw = await apiUpdateMenuItem(token, menuItem.id, formData);
      updateMenuItem(updatedRaw);
      if (onSuccess) onSuccess('Menu item updated successfully!');
      onCancel();
    } catch (err: any) {
      if (onError) onError(err.message || 'Failed to update menu item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 px-6 py-5 text-white">
        <h3 className="text-xl font-black flex items-center gap-2">
          <span>✏️</span> Edit Menu Item: {menuItem.name}
        </h3>
        <p className="text-xs text-blue-50/80 mt-1">
          Modify the item details, pricing, or description below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side: Image and Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Item Image
              </label>
              <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-blue-400 transition-all bg-gray-55/50 overflow-hidden flex flex-col justify-center items-center min-h-[160px]">
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
                    <span className="text-3xl block">📸</span>
                    <span className="text-[11px] font-semibold text-gray-400">
                      Drag or select item image
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

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="List ingredients, dietary notes, portion size..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition text-sm"
              />
            </div>
          </div>

          {/* Right Side: Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gourmet Margherita Pizza"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                placeholder="e.g. 14.99"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition text-sm"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-bold text-sm transition shadow-md disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
