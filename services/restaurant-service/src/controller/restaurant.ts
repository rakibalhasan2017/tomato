import { Request, Response } from 'express';
import axios from 'axios';
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

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: 'Missing required field: image file',
      });
    }

    let imageUrl = '';
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
      formData.append('image', blob, file.originalname);

      const headers: Record<string, string> = {};
      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }

      const utilitiesUrl = process.env.UTILITIES_SERVICE_URL || 'http://localhost:5002';
      const uploadResponse = await axios.post(`${utilitiesUrl}/api/utilities/upload`, formData, {
        headers,
      });

      if (!uploadResponse.data || !uploadResponse.data.imageUrl) {
        return res.status(500).json({
          error: 'Failed to upload image: Invalid response from utility service',
        });
      }

      imageUrl = uploadResponse.data.imageUrl;
    } catch (uploadError: any) {
      console.error(
        'Failed to upload image to utility service:',
        uploadError.response?.data || uploadError.message
      );
      return res.status(uploadError.response?.status || 500).json({
        error:
          uploadError.response?.data?.error ||
          uploadError.response?.data?.message ||
          'Failed to upload image to utility service',
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
    const { name, description, phonenumber, latitude, longitude, formattedAddress, image, status } = req.body;

    let imageUrl = '';
    if (image) {
      try {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(image.buffer)], { type: image.mimetype });
        formData.append('image', blob, image.originalname);

        const headers: Record<string, string> = {};
        if (req.headers.authorization) {
          headers['Authorization'] = req.headers.authorization;
        }

        const utilitiesUrl = process.env.UTILITIES_SERVICE_URL || 'http://localhost:5002';
        const uploadResponse = await axios.post(`${utilitiesUrl}/api/utilities/upload`, formData, {
          headers,
        });

        if (!uploadResponse.data || !uploadResponse.data.imageUrl) {
          return res.status(500).json({
            error: 'Failed to upload image: Invalid response from utility service',
          });
        }

        imageUrl = uploadResponse.data.imageUrl;
      } catch (uploadError: any) {
        console.error(
          'Failed to upload image to utility service:',
          uploadError.response?.data || uploadError.message
        );
        return res.status(uploadError.response?.status || 500).json({
          error:
            uploadError.response?.data?.error ||
            uploadError.response?.data?.message ||
            'Failed to upload image to utility service',
        });
      }
    }

    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { owenerID: user.id },
      {
        name,
        description,
        phonenumber,
        isopen: status,
        image: imageUrl,
        autolocation: {
          type: 'Point' as const,
          coordinates: [Number(longitude), Number(latitude)],
          formattedAddress: String(formattedAddress),
        },
      },
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
