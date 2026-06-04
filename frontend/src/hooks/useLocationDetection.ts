import { useEffect } from 'react';
import { useAuth } from '../context/auth-context';
import { useLocation } from '../context/location-context';
import { getBrowserLocation, reverseGeocode } from '../services/geolocation';
import { updateCurrentLocation } from '../services/api';
import type { BrowserLocationError } from '../services/geolocation';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UseLocationDetectionReturn {
  locationLabel: string;
  locationError: string | null;
  isLocating: boolean;
  locationGranted: boolean;
  coordinates: Coordinates | null;
  handleGetLocation: () => Promise<void>;
}

const formatCoordinateFallback = (latitude: number, longitude: number) =>
  `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`;

export const useLocationDetection = (): UseLocationDetectionReturn => {
  const { token, currentLocation, setCurrentLocation } = useAuth();
  const { locationLabel, locationError, isLocating, setLocationLabel, setLocationError, setIsLocating } =
    useLocation();

  const locationGranted =
    currentLocation?.permission === 'granted' && !!currentLocation.point?.coordinates;

  const coordinates: Coordinates | null = locationGranted
    ? {
        latitude: currentLocation!.point!.coordinates[1],
        longitude: currentLocation!.point!.coordinates[0],
      }
    : null;

  useEffect(() => {
    let isCancelled = false;

    const resolveLabel = async () => {
      if (currentLocation?.permission === 'denied') {
        setLocationLabel('Location access was denied');
        return;
      }
      if (currentLocation?.permission === 'unavailable') {
        setLocationLabel('Location is unavailable right now');
        return;
      }
      if (currentLocation?.permission === 'granted' && currentLocation.point?.coordinates) {
        const [longitude, latitude] = currentLocation.point.coordinates;
        setLocationLabel('Resolving location address...');
        const address = await reverseGeocode(latitude, longitude);
        if (!isCancelled) {
          setLocationLabel(address ?? formatCoordinateFallback(latitude, longitude));
        }
        return;
      }
      setLocationLabel('Location not detected yet');
    };

    void resolveLabel();
    return () => {
      isCancelled = true;
    };
  }, [currentLocation]);

  const handleGetLocation = async () => {
    if (!token) {
      setLocationError('You are not authenticated. Please sign in again.');
      return;
    }
    setLocationError(null);
    setIsLocating(true);
    setLocationLabel('Detecting your location...');

    try {
      const browserLocation = await getBrowserLocation();
      const response = await updateCurrentLocation(token, {
        latitude: browserLocation.latitude,
        longitude: browserLocation.longitude,
        accuracyMeters: browserLocation.accuracyMeters,
        capturedAt: browserLocation.capturedAt,
        permission: 'granted',
      });
      setCurrentLocation(response.currentLocation);

      if (response.currentLocation?.point?.coordinates) {
        const [longitude, latitude] = response.currentLocation.point.coordinates;
        setLocationLabel('Resolving location address...');
        const address = await reverseGeocode(latitude, longitude);
        setLocationLabel(address ?? formatCoordinateFallback(latitude, longitude));
      } else {
        setLocationLabel('Location detected successfully');
      }
    } catch (error) {
      const err = error as BrowserLocationError;
      const permission = err.code === 'permission_denied' ? 'denied' : 'unavailable';
      await updateCurrentLocation(token, { permission });
      setCurrentLocation(null);
      setLocationLabel(
        permission === 'denied' ? 'Location access was denied' : 'Location is unavailable right now',
      );
      setLocationError(err?.message ?? 'Unable to fetch location. Please try again.');
    } finally {
      setIsLocating(false);
    }
  };

  return { locationLabel, locationError, isLocating, locationGranted, coordinates, handleGetLocation };
};
