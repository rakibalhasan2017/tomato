import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_RESTAURANT_URL = 'http://localhost:5001/api/restaurant';

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

export interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  image: string;
  owenerID: string;
  phonenumber: string;
  isverified: boolean;
  isopen: boolean;
  createdAt: string;
  autolocation?: {
    type: 'Point';
    coordinates: [number, number];
    formattedAddress: string;
  };
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


export const getMyRestaurant = async (token: string): Promise<Restaurant> => {
  try {
    const { data } = await axios.get<{ restaurant: Restaurant }>(`${API_RESTAURANT_URL}/myrestaurant`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data.restaurant;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to fetch restaurant'));
  }
};

export const createRestaurant = async (token: string, formData: FormData): Promise<Restaurant> => {
  try {
    const { data } = await axios.post<{ restaurant: Restaurant }>(
      `${API_RESTAURANT_URL}/addnew`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return data.restaurant;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to create restaurant'));
  }
};

export const updateRestaurant = async (token: string, formData: FormData): Promise<Restaurant> => {
  try {
    const { data } = await axios.put<{ restaurant: Restaurant }>(
      `${API_RESTAURANT_URL}/update`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return data.restaurant;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to update restaurant'));
  }
};

