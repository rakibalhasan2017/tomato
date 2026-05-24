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

    const { name, description, phonenumber, latitude, longitude, formattedAddress } = req.body;

    if (
      !name ||
      !phonenumber ||
      latitude === undefined ||
      longitude === undefined ||
      !formattedAddress
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    const imageUrl = req.body.imageUrl;
    if (!imageUrl) {
      return res.status(400).json({
        error: 'Missing required field: image file',
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
      image: imageUrl,
      owenerID: user.id,
      phonenumber,
      autolocation,
    });

    return res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant: newRestaurant,
    });
  } catch (error) {
    console.error('Add restaurant error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getmyrestaurant = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const restaurant = await Restaurant.findOne({ owenerID: user.id });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found for this user' });
    }
    return res.status(200).json({ restaurant });
  } catch (error) {
    console.error('Get restaurants error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateresturant = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const restaurant = await Restaurant.findOne({ owenerID: user.id });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found for this user' });
    }
    const { name, description, phonenumber, latitude, longitude, formattedAddress, imageUrl, status } = req.body;

    const updateFields: any = {
      name,
      description,
      phonenumber,
      isopen: status,
    };

    if (imageUrl) {
      updateFields.image = imageUrl;
    }

    if (latitude !== undefined && longitude !== undefined && formattedAddress !== undefined) {
      updateFields.autolocation = {
        type: 'Point' as const,
        coordinates: [Number(longitude), Number(latitude)],
        formattedAddress: String(formattedAddress),
      };
    }

    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { owenerID: user.id },
      updateFields,
      { new: true }
    );


    return res.status(200).json({
      message: 'Restaurant updated successfully',
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};    
