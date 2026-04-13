const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  image: string;
  role: string | null;
  currentLocation?: CurrentLocation | null;
}

export interface CurrentLocation {
  point: {
    type: 'Point';
    coordinates: [number, number];
  };
  accuracyMeters?: number;
  capturedAt: string;
  source: 'browser';
  permission: 'granted' | 'denied' | 'unavailable';
}

interface UpdateLocationPayload {
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  capturedAt?: string;
  permission: 'granted' | 'denied' | 'unavailable';
}

export const getGoogleAuthUrl = (): string => {
  return `${API_BASE_URL}/auth/google`;
};

export const getMyProfile = async (token: string): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch profile');
  }

  return response.json();
};

export const updateRole = async (token: string, role: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/addrole`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update role');
  }

  return response.json();
};

export const updateCurrentLocation = async (
  token: string,
  payload: UpdateLocationPayload,
): Promise<{ message: string; currentLocation: CurrentLocation | null }> => {
  const response = await fetch(`${API_BASE_URL}/auth/location`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update current location');
  }

  return response.json();
};

export const getCurrentLocation = async (
  token: string,
): Promise<{ currentLocation: CurrentLocation | null }> => {
  const response = await fetch(`${API_BASE_URL}/auth/location`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch current location');
  }

  return response.json();
};
