import { Request, Response } from 'express';
import User from '../model/user.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

interface LocationBody {
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  capturedAt?: string;
  permission?: 'granted' | 'denied' | 'unavailable';
}

const isValidLatitude = (latitude: number) => latitude >= -90 && latitude <= 90;
const isValidLongitude = (longitude: number) => longitude >= -180 && longitude <= 180;

export const updateCurrentLocation = async (req: AuthRequest, res: Response) => {
  const email = req.user?.email;
  const { latitude, longitude, accuracyMeters, capturedAt, permission } = req.body as LocationBody;

  try {
    if (!email) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!permission || !['granted', 'denied', 'unavailable'].includes(permission)) {
      return res.status(400).json({ error: 'Invalid permission value' });
    }

    if (permission !== 'granted') {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.currentLocation = {
        capturedAt: new Date(),
        source: 'browser',
        permission,
      };
      await user.save();

      return res.status(200).json({
        message: 'Location permission state stored',
        currentLocation: user.currentLocation,
      });
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res
        .status(400)
        .json({ error: 'Latitude and longitude are required for granted permission' });
    }

    if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude range' });
    }

    if (
      accuracyMeters !== undefined &&
      (typeof accuracyMeters !== 'number' || accuracyMeters < 0)
    ) {
      return res.status(400).json({ error: 'Accuracy must be a positive number' });
    }

    const capturedAtDate = capturedAt ? new Date(capturedAt) : new Date();
    if (Number.isNaN(capturedAtDate.getTime())) {
      return res.status(400).json({ error: 'Invalid capturedAt timestamp' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.currentLocation = {
      point: { type: 'Point', coordinates: [longitude, latitude] },
      capturedAt: capturedAtDate,
      source: 'browser',
      permission,
      ...(accuracyMeters !== undefined ? { accuracyMeters } : {}),
    };

    await user.save();

    return res.status(200).json({
      message: 'Current location updated',
      currentLocation: user.currentLocation,
    });
  } catch (error) {
    console.error('Current location update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrentLocation = async (req: AuthRequest, res: Response) => {
  const email = req.user?.email;
  try {
    if (!email) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findOne({ email }).select('currentLocation');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ currentLocation: user.currentLocation ?? null });
  } catch (error) {
    console.error('Current location fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
