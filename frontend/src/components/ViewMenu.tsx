import React, { useState } from 'react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  isAvailable: boolean;
}

const MOCK_MENU: MenuItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    price: 12.99,
    category: 'Main Course',
    description: 'Fresh mozzarella, san marzano tomatoes, fresh basil, and extra virgin olive oil.',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Truffle Parmesan Fries',
    price: 8.49,
    category: 'Starters',
    description: 'Crispy golden fries tossed in black truffle oil, freshly grated parmesan cheese, and parsley.',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Chocolate Lava Cake',
    price: 6.99,
    category: 'Desserts',
    description: 'Warm chocolate cake with a molten chocolate center, served with vanilla bean ice cream.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    isAvailable: false,
  },
];

interface ViewMenuProps {
  token: string;
}

export const ViewMenu: React.FC<ViewMenuProps> = ({ token }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_MENU);

  const categories = ['All', 'Starters', 'Main Course', 'Desserts', 'Beverages'];

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const toggleAvailability = (id: string) => {
    if (!token) return;
    setMenuItems(prev =>
      prev.map(item => (item.id === id ? { ...item, isAvailable: !item.isAvailable } : item))
    );
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${selectedCategory === cat
              ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <span className="text-4xl">🍽️</span>
          <p className="text-gray-500 text-sm mt-3 font-medium">No items found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex transition-all duration-300 hover:shadow-md ${!item.isAvailable ? 'opacity-80' : ''
                }`}
            >
              {/* Image */}
              <div className="w-1/3 relative bg-gray-100 min-h-[120px]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
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
                    <span className="text-red-500 font-extrabold text-sm">${item.price.toFixed(2)}</span>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">
                    {item.category}
                  </span>
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
                    <button className="text-xs font-bold text-blue-500 hover:text-blue-600 transition cursor-pointer">
                      Edit
                    </button>
                    <button className="text-xs font-bold text-red-500 hover:text-red-600 transition cursor-pointer">
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
