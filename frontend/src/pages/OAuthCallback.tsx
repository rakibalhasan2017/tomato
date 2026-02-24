import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../services/api';

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const token = searchParams.get('token');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    // If already logged in and no token in URL, redirect to dashboard
    if (user && !token) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (errorParam) {
      setError(
        errorParam === 'no_code'
          ? 'No authorization code received'
          : errorParam === 'no_email'
            ? 'Email not provided by Google'
            : 'Authentication failed',
      );
      setIsProcessing(false);
      return;
    }

    if (token) {
      handleTokenCallback(token);
    } else {
      // No token, redirect to dashboard (ProtectedRoute will handle auth check)
      navigate('/dashboard', { replace: true });
    }
  }, [token, errorParam, user]);

  const handleTokenCallback = async (token: string) => {
    try {
      const userProfile = await getMyProfile(token);
      login(token, userProfile);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-400">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-400">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 text-center">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return <Navigate to="/dashboard" replace />;
};

export default OAuthCallback;
