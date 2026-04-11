import { useAuth } from '../context/auth-context';
import { Navbar } from '../components/Navbar';

export const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-6">
            <img
              src={user.image}
              alt={user.name}
              className="w-20 h-20 rounded-full border-4 border-red-500"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user.name}!</h2>
              <p className="text-gray-500">{user.email}</p>
              {user.role && (
                <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium capitalize">
                  {user.role}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🍕</span>
            </div>
            <h4 className="font-semibold text-gray-800">Order Food</h4>
            <p className="text-gray-500 text-sm mt-1">
              Browse restaurants and order your favorite meals
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h4 className="font-semibold text-gray-800">Track Orders</h4>
            <p className="text-gray-500 text-sm mt-1">View and track your current orders</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⭐</span>
            </div>
            <h4 className="font-semibold text-gray-800">Favorites</h4>
            <p className="text-gray-500 text-sm mt-1">Quick access to your favorite restaurants</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
