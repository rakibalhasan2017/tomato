import React, { useState } from 'react';

interface AddMenuItemProps {
  token: string;
  onSuccess?: (message: string | null) => void;
  onError?: (message: string | null) => void;
}

export const AddMenuItem: React.FC<AddMenuItemProps> = ({ token, onSuccess, onError }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsLoading(true);
    if (onError) onError(null);
    if (onSuccess) onSuccess(null);

    // Print form data to console for visibility
    console.log('Submitting new menu item:', {
      name,
      price,
      description,
      category,
      imageFile,
    });

    // Simulated API Call
    setTimeout(() => {
      setIsLoading(false);
      if (onSuccess) onSuccess('Menu item added successfully (mock data)!');
      // Reset form
      setName('');
      setPrice('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 px-6 py-5 text-white">
        <h3 className="text-xl font-black flex items-center gap-2">
          <span>🍔</span> Add New Menu Item
        </h3>
        <p className="text-xs text-red-50/80 mt-1">
          Create delicious new offerings to showcase on your public menu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side: Images and Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Item Image
              </label>
              <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-red-400 transition-all bg-gray-50/50 overflow-hidden flex flex-col justify-center items-center min-h-[160px]">
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition text-sm"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition text-sm"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition text-sm bg-white"
              >
                <option value="Starters">Starters</option>
                <option value="Main Course">Main Course</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-50">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold text-sm transition shadow-md disabled:opacity-60"
          >
            {isLoading ? 'Saving...' : 'Add Item to Menu'}
          </button>
        </div>
      </form>
    </div>
  );
};
