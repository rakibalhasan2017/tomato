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

export const getBrowserLocation = (timeoutMs = 10000): Promise<BrowserLocationSuccess> => {
  if (!('geolocation' in navigator)) {
    return new Promise((_resolve, reject) => {
      reject({
        code: 'unsupported',
        message: 'Geolocation is not supported in this browser.',
      } satisfies BrowserLocationError);
    });
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          capturedAt: new Date(position.timestamp).toISOString(),
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject({
            code: 'permission_denied',
            message: 'Location permission denied. Enable it to order food.',
          } satisfies BrowserLocationError);
          return;
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          reject({
            code: 'position_unavailable',
            message: 'Unable to detect location. Please try again.',
          } satisfies BrowserLocationError);
          return;
        }

        if (error.code === error.TIMEOUT) {
          reject({
            code: 'timeout',
            message: 'Location request timed out. Please retry.',
          } satisfies BrowserLocationError);
          return;
        }

        reject({
          code: 'unknown',
          message: 'Unable to fetch location.',
        } satisfies BrowserLocationError);
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0,
      },
    );
  });
};

export const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<string | null> => {
  try {
    const endpoint = new URL('https://nominatim.openstreetmap.org/reverse');
    endpoint.searchParams.set('format', 'jsonv2');
    endpoint.searchParams.set('lat', String(latitude));
    endpoint.searchParams.set('lon', String(longitude));
    endpoint.searchParams.set('addressdetails', '1');

    const response = await fetch(endpoint.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ReverseGeocodeResponse;
    return data.display_name ?? null;
  } catch {
    return null;
  }
};
