import { Navbar } from '../components/Navbar';

export const Favorites = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Favorite Restaurants</h2>
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <span className="text-4xl mb-4 block">⭐</span>
          <p className="text-gray-500">You have not added any favorite restaurants yet.</p>
        </div>
      </main>
    </div>
  );
};

export default Favorites;
