import { Request, Response } from 'express';
import axios from 'axios';
import Restaurant from '../model/restaurant';
import MenuItem from '../model/menuitem';

interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export const addmenuitem = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { name, description, price, image, category, isavailable } = req.body;
        const restaurant = await Restaurant.findOne({ owenerID: user.id });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        if (
            !name ||
            !description ||
            !price ||
            !image ||
            !category ||
            !isavailable
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
        const menuitem = new MenuItem({
            name,
            description,
            price,
            image: imageUrl,
            category,
            isavailable,
            restaurantID: restaurant._id,
        });
        await menuitem.save();
        return res.status(201).json({ message: 'Menu item added successfully', menuitem });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const getmenuitem = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const restaurant = await Restaurant.findOne({ owenerID: user.id });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        const menuitem = await MenuItem.find({ restaurantID: restaurant._id });
        return res.status(200).json({ menuitem });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const deletemenuitem = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const restaurant = await Restaurant.findOne({ owenerID: user.id });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'Menu item ID is required' });
        }
        const menuitem = await MenuItem.find({ _id: id, restaurantID: restaurant._id });
        if (menuitem.length === 0) {
            return res.status(403).json({ message: 'You are not authorized to delete this menu item' });
        }
        await MenuItem.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}   


