import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_RESTAURANT_URL = 'http://localhost:5001/api/restaurant';
const API_MENU_URL = 'http://localhost:5001/api/menu';

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
  distance?: number;
}

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  isavailable: boolean;
  restaurantID: string;
  createdAt?: string;
  updatedAt?: string;
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
      }
    );

    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to update role'));
  }
};

export const updateCurrentLocation = async (
  token: string,
  payload: UpdateLocationPayload
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
  token: string
): Promise<{ currentLocation: CurrentLocation | null }> => {
  try {
    const { data } = await axios.get<{ currentLocation: CurrentLocation | null }>(
      `${API_BASE_URL}/auth/location`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to fetch current location'));
  }
};

export const getMyRestaurant = async (token: string): Promise<Restaurant> => {
  try {
    const { data } = await axios.get<{ restaurant: Restaurant }>(
      `${API_RESTAURANT_URL}/myrestaurant`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
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
      }
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
      }
    );
    return data.restaurant;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to update restaurant'));
  }
};

export const getNearbyRestaurants = async (
  token: string,
  latitude: number,
  longitude: number
): Promise<Restaurant[]> => {
  try {
    const { data } = await axios.get<{ restaurants: Restaurant[] }>(
      `${API_RESTAURANT_URL}/nearby`,
      {
        params: { latitude, longitude },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data.restaurants;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to fetch nearby restaurants'));
  }
};

export const getMenuItems = async (token: string): Promise<MenuItem[]> => {
  try {
    const { data } = await axios.get<{ menuitem: MenuItem[] }>(`${API_MENU_URL}/getmenuitem`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data.menuitem;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to fetch menu items'));
  }
};

export const createMenuItem = async (token: string, formData: FormData): Promise<MenuItem> => {
  try {
    const { data } = await axios.post<{ message: string; menuitem: MenuItem }>(
      `${API_MENU_URL}/addmenuitem`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data.menuitem;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to create menu item'));
  }
};

export const updateMenuItem = async (
  token: string,
  id: string,
  formData: FormData
): Promise<MenuItem> => {
  try {
    const { data } = await axios.put<{ message: string; menuitem: MenuItem }>(
      `${API_MENU_URL}/updatemenuitem/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data.menuitem;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to update menu item'));
  }
};

export const deleteMenuItem = async (token: string, id: string): Promise<{ message: string }> => {
  try {
    const { data } = await axios.delete<{ message: string }>(
      `${API_MENU_URL}/deletemenuitem/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to delete menu item'));
  }
};
