import { Request, Response } from 'express';
import Restaurant from '../model/restaurant.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const addresturant = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const existingResturant = await Restaurant.findOne({
      owenerID: user.id,
    });

    if (existingResturant) {
      return res.status(400).json({ error: 'User already owns a restaurant' });
    }

    const {
      name,
      description,
      image, // ✅ THIS NOW COMES FROM CLOUDINARY URL
      phonenumber,
      latitude,
      longitude,
      formattedAddress,
    } = req.body;

    if (
      !name ||
      !image ||
      !phonenumber ||
      latitude === undefined ||
      longitude === undefined ||
      !formattedAddress
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    const autolocation = {
      type: 'Point' as const,
      coordinates: [Number(longitude), Number(latitude)],
      formattedAddress: String(formattedAddress),
    };

    const newRestaurant = await Restaurant.create({
      name,
      description,
      image,
      owenerID: user.id,
      phonenumber,
      autolocation,
    });

    return res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant: newRestaurant,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
