import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { updateRole } from '../services/api';

type Role = 'customer' | 'rider' | 'seller';

const ROLE_OPTIONS: Array<{ value: Role; title: string; description: string; icon: string }> = [
  {
    value: 'customer',
    title: 'Customer',
    description: 'Browse restaurants, place orders, and track your food.',
    icon: '🛍️',
  },
  {
    value: 'rider',
    title: 'Rider',
    description: 'Accept deliveries and bring meals to customers.',
    icon: '🛵',
  },
  {
    value: 'seller',
    title: 'Seller',
    description: 'Manage your store and fulfill incoming orders.',
    icon: '🏪',
  },
];

export const Roleadd = () => {
  const navigate = useNavigate();
  const { user, token, updateUser, logout } = useAuth();

  const [selectedRole, setSelectedRole] = useState<Role | null>(
    user?.role && ['customer', 'rider', 'seller'].includes(user.role) ? (user.role as Role) : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const welcomeName = useMemo(() => user?.name?.split(' ')[0] ?? 'there', [user?.name]);

  const handleSubmit = async () => {
    if (!token || !user) {
      setError('You are not authenticated. Please sign in again.');
      return;
    }

    if (!selectedRole) {
      setError('Please choose one role to continue.');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      await updateRole(token, selectedRole);
      updateUser({ ...user, role: selectedRole });
      navigate('/dashboard', { replace: true });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to update role right now. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-red-50 to-orange-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
          <div className="bg-linear-to-r from-red-600 via-orange-500 to-amber-400 px-8 py-8 text-white">
            <p className="uppercase tracking-[0.18em] text-xs font-semibold mb-3">Tomato Setup</p>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight">Pick Your Role</h1>
            <p className="mt-3 text-red-50 text-sm sm:text-base">
              Hi {welcomeName}, choose how you want to use Tomato.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROLE_OPTIONS.map((option) => {
                const isActive = selectedRole === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedRole(option.value);
                      setError(null);
                    }}
                    className={`text-left rounded-2xl p-5 border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                      isActive
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    <div className="text-2xl mb-3">{option.icon}</div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">{option.title}</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">{option.description}</p>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={handleSignOut}
                className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Sign out
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? 'Saving role...' : 'Continue to Dashboard'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roleadd;
