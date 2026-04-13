import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { Navbar } from '../components/Navbar';

export const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    useAuth.persist.clearStorage();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h2>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* User Profile Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 h-32 relative">
            <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-full shadow-lg">
              <img
                src={user.image}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
              />
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                <p className="text-gray-500">{user.email}</p>
                {user.role && (
                  <span className="inline-block mt-2 px-3 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-semibold tracking-wide uppercase">
                    {user.role}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Management
              </h4>
              <div className="divide-y divide-gray-100">
                <Link
                  to="/track-order"
                  className="flex items-center justify-between py-4 group hover:px-2 transition-all rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-red-600">
                        Track Order
                      </p>
                      <p className="text-xs text-gray-500">View and track your packages</p>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>

                <Link
                  to="/favourite-resturant"
                  className="flex items-center justify-between py-4 group hover:px-2 transition-all rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.951a1 1 0 00.95.69h4.154c.969 0 1.371 1.24.588 1.81l-3.36 2.442a1 1 0 00-.364 1.118l1.285 3.95c.3.922-.755 1.688-1.539 1.118l-3.36-2.441a1 1 0 00-1.175 0l-3.36 2.441c-.783.57-1.838-.196-1.539-1.118l1.285-3.95a1 1 0 00-.364-1.118L2.98 9.378c-.783-.57-.38-1.81.588-1.81h4.154a1 1 0 00.95-.69l1.377-3.951z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-red-600">
                        Favorites
                      </p>
                      <p className="text-xs text-gray-500">
                        Quick access to your favorite restaurants
                      </p>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between py-4 group hover:px-2 transition-all rounded-lg text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-red-600">Logout</p>
                      <p className="text-xs text-gray-500">Sign out of your account</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Account;
