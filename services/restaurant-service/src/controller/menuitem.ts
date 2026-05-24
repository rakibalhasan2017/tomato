import { Request, Response } from 'express';
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
            isavailable === undefined
        ) {
            return res.status(400).json({
                error: 'Missing required fields',
            });
        }

        const menuitem = new MenuItem({
            name,
            description,
            price,
            image,
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

export const updatemenuitem = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const restaurant = await Restaurant.findOne({
            owenerID: user.id
        });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ message: 'Menu item ID is required' });
        }
        const menuitem = await MenuItem.findOne({
            _id: id,
            restaurantID: restaurant._id
        });

        if (!menuitem) {
            return res.status(403).json({
                message: 'You are not authorized or item not found'
            });
        }

        const {
            name,
            description,
            price,
            image,
            isavailable
        } = req.body;

        if (name !== undefined) menuitem.name = name;
        if (description !== undefined) menuitem.description = description;
        if (price !== undefined) menuitem.price = price;
        if (isavailable !== undefined) menuitem.isavailable = isavailable;

        if (image !== undefined) menuitem.image = image;

        await menuitem.save();

        return res.status(200).json({
            message: 'Menu item updated successfully',
            menuitem
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};