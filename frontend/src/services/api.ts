import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    return data?.error || data?.message || error.message || fallbackMessage;
  }

  return fallbackMessage;
};

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
  try {
    const { data } = await axios.get<UserProfile>(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to fetch profile'));
  }
};

export const updateRole = async (token: string, role: string): Promise<{ message: string }> => {
  try {
    const { data } = await axios.put<{ message: string }>(
      `${API_BASE_URL}/auth/addrole`,
      { role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to update role'));
  }
};

export const updateCurrentLocation = async (
  token: string,
  payload: UpdateLocationPayload,
): Promise<{ message: string; currentLocation: CurrentLocation | null }> => {
  try {
    const { data } = await axios.put<{
      message: string;
      currentLocation: CurrentLocation | null;
    }>(`${API_BASE_URL}/auth/location`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to update current location'));
  }
};

export const getCurrentLocation = async (
  token: string,
): Promise<{ currentLocation: CurrentLocation | null }> => {
  try {
    const { data } = await axios.get<{ currentLocation: CurrentLocation | null }>(
      `${API_BASE_URL}/auth/location`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to fetch current location'));
  }
};
