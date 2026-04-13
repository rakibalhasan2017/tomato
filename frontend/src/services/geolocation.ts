export interface BrowserLocationSuccess {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  capturedAt: string;
}

export type BrowserLocationErrorCode =
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'unsupported'
  | 'unknown';

export interface BrowserLocationError {
  code: BrowserLocationErrorCode;
  message: string;
}

interface ReverseGeocodeResponse {
  display_name?: string;
}

export const getBrowserLocation = async (timeoutMs = 10000): Promise<BrowserLocationSuccess> => {
  if (!('geolocation' in navigator)) {
    throw {
      code: 'unsupported',
      message: 'Geolocation is not supported in this browser.',
    } satisfies BrowserLocationError;
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        console.log('Geolocation error:', error); // Debug log to check error details
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject({
              code: 'permission_denied',
              message: 'Location permission denied. Please enable location access.',
            } satisfies BrowserLocationError);
            break;

          case error.POSITION_UNAVAILABLE:
            reject({
              code: 'position_unavailable',
              message: 'Location unavailable. Try again later.',
            } satisfies BrowserLocationError);
            break;

          case error.TIMEOUT:
            reject({
              code: 'timeout',
              message: 'Location request timed out.',
            } satisfies BrowserLocationError);
            break;

          default:
            reject({
              code: 'unknown',
              message: 'Unknown error occurred while fetching location.',
            } satisfies BrowserLocationError);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0,
      },
    );
  });
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  let accuracyMeters = position.coords.accuracy;
  let capturedAt = new Date(position.timestamp).toISOString();
  console.log('Browser location obtained:', { latitude, longitude, accuracyMeters, capturedAt }); // Debug log to check location details

  return {
    latitude,
    longitude,
    accuracyMeters,
    capturedAt,
  };
};

export const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<string | null> => {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');

    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(latitude));
    url.searchParams.set('lon', String(longitude));
    url.searchParams.set('addressdetails', '1');

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) return null;

    const data: ReverseGeocodeResponse = await response.json();

    return data.display_name ?? null;
  } catch {
    return null;
  }
};
