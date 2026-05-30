import React, { useEffect, useState } from 'react';
import { useMenu } from '../context/menu-context';
import {
  getMenuItems,
  deleteMenuItem as apiDeleteMenuItem,
  updateMenuItem as apiUpdateMenuItem,
} from '../services/api';
import { UpdateMenuItem } from './UpdateMenuItem';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  isAvailable: boolean;
}

interface ViewMenuProps {
  token: string;
  onSuccess?: (message: string | null) => void;
  onError?: (message: string | null) => void;
}

export const ViewMenu: React.FC<ViewMenuProps> = ({ token, onSuccess, onError }) => {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const {
    menuItems: contextItems,
    menuLoading,
    menuError,
    setMenuItems,
    updateMenuItem,
    deleteMenuItem,
    setMenuLoading,
    setMenuError,
  } = useMenu();

  // Map context items to UI items
  const menuItems = contextItems.map((item) => ({
    id: item._id,
    name: item.name,
    price: item.price,
    description: item.description || '',
    image: item.image,
    isAvailable: item.isavailable,
  }));

  useEffect(() => {
    if (!token) return;
    const fetchMenu = async () => {
      setMenuLoading(true);
      setMenuError(null);
      try {
        const items = await getMenuItems(token);
        setMenuItems(items);
      } catch (err: any) {
        setMenuError(err.message || 'Failed to load menu items');
      } finally {
        setMenuLoading(false);
      }
    };
    void fetchMenu();
  }, [token, setMenuItems, setMenuLoading, setMenuError]);

  const toggleAvailability = async (id: string) => {
    if (!token) return;
    const item = menuItems.find((i) => i.id === id);
    if (!item) return;
    if (onError) onError(null);

    try {
      const formData = new FormData();
      formData.append('isavailable', String(!item.isAvailable));
      const updated = await apiUpdateMenuItem(token, id, formData);
      updateMenuItem(updated);
    } catch (err: any) {
      if (onError) onError(err.message || 'Failed to toggle availability');
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    if (onError) onError(null);
    if (onSuccess) onSuccess(null);
    try {
      await apiDeleteMenuItem(token, id);
      deleteMenuItem(id);
      if (onSuccess) onSuccess('Menu item deleted successfully!');
    } catch (err: any) {
      if (onError) onError(err.message || 'Failed to delete menu item');
      console.error('Failed to delete menu item:', err);
    }
  };

  if (editingItem) {
    return (
      <UpdateMenuItem
        token={token}
        menuItem={editingItem}
        onCancel={() => setEditingItem(null)}
        onSuccess={onSuccess}
        onError={onError}
      />
    );
  }

  if (menuLoading && menuItems.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (menuError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
        {menuError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid List */}
      {menuItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <span className="text-4xl">🍽️</span>
          <p className="text-gray-500 text-sm mt-3 font-medium">No items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex transition-all duration-300 hover:shadow-md ${!item.isAvailable ? 'opacity-80' : ''
                }`}
            >
              {/* Image */}
              <div className="w-1/3 relative bg-gray-100 min-h-[120px]">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="w-2/3 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                    <span className="text-red-500 font-extrabold text-sm">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400">Available</span>
                    <button
                      type="button"
                      onClick={() => toggleAvailability(item.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.isAvailable ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${item.isAvailable ? 'translate-x-4' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="text-xs font-bold text-blue-500 hover:text-blue-600 transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs font-bold text-red-500 hover:text-red-600 transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
