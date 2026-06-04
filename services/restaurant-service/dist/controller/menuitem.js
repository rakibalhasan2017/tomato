"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenuItemsByRestaurant = exports.updatemenuitem = exports.deletemenuitem = exports.getmenuitem = exports.addmenuitem = void 0;
const restaurant_1 = __importDefault(require("../model/restaurant"));
const menuitem_1 = __importDefault(require("../model/menuitem"));
const addmenuitem = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { name, description, price, image, isavailable } = req.body;
        const restaurant = await restaurant_1.default.findOne({ owenerID: user.id });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        if (!name || !description || !price || !image || isavailable === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
            });
        }
        const menuitem = new menuitem_1.default({
            name,
            description,
            price,
            image,
            isavailable,
            restaurantID: restaurant._id,
        });
        await menuitem.save();
        return res.status(201).json({ message: 'Menu item added successfully', menuitem });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.addmenuitem = addmenuitem;
const getmenuitem = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const restaurant = await restaurant_1.default.findOne({ owenerID: user.id });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        const menuitem = await menuitem_1.default.find({ restaurantID: restaurant._id });
        return res.status(200).json({ menuitem });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getmenuitem = getmenuitem;
const deletemenuitem = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const restaurant = await restaurant_1.default.findOne({ owenerID: user.id });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'Menu item ID is required' });
        }
        const menuitem = await menuitem_1.default.find({ _id: id, restaurantID: restaurant._id });
        if (menuitem.length === 0) {
            return res.status(403).json({ message: 'You are not authorized to delete this menu item' });
        }
        await menuitem_1.default.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Menu item deleted successfully' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deletemenuitem = deletemenuitem;
const updatemenuitem = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const restaurant = await restaurant_1.default.findOne({
            owenerID: user.id,
        });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'Menu item ID is required' });
        }
        const menuitem = await menuitem_1.default.findOne({
            _id: id,
            restaurantID: restaurant._id,
        });
        if (!menuitem) {
            return res.status(403).json({
                message: 'You are not authorized or item not found',
            });
        }
        const { name, description, price, image, isavailable } = req.body;
        if (name !== undefined)
            menuitem.name = name;
        if (description !== undefined)
            menuitem.description = description;
        if (price !== undefined)
            menuitem.price = price;
        if (isavailable !== undefined)
            menuitem.isavailable = isavailable;
        if (image !== undefined)
            menuitem.image = image;
        await menuitem.save();
        return res.status(200).json({
            message: 'Menu item updated successfully',
            menuitem,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
};
exports.updatemenuitem = updatemenuitem;
const getMenuItemsByRestaurant = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { restaurantId } = req.params;
        if (!restaurantId) {
            return res.status(400).json({ error: 'Restaurant ID is required' });
        }
        const menuItems = await menuitem_1.default.find({ restaurantID: restaurantId });
        return res.status(200).json({ menuItems });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMenuItemsByRestaurant = getMenuItemsByRestaurant;
