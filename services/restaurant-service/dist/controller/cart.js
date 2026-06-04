"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartItemQuantity = exports.removeFromCart = exports.clearCart = exports.getCart = exports.addToCart = void 0;
const cart_model_js_1 = __importDefault(require("../model/cart-model.js"));
const addToCart = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { restaurantID, menuItemID, quantity } = req.body;
        if (!restaurantID || !menuItemID || !quantity) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const cartofdifferentrestaurant = await cart_model_js_1.default.findOne({
            userID: user.id,
            restaurantID: { $ne: restaurantID },
        });
        if (cartofdifferentrestaurant) {
            return res
                .status(400)
                .json({
                error: 'You have items from a different restaurant in your cart. Please clear your cart before adding items from another restaurant.',
            });
        }
        let cart = await cart_model_js_1.default.findOne({ userID: user.id, restaurantID });
        if (!cart) {
            cart = new cart_model_js_1.default({
                userID: user.id,
                restaurantID,
                items: [{ menuItemID, quantity }],
            });
        }
        else {
            const itemIndex = cart.items.findIndex((item) => item.menuItemID.toString() === menuItemID);
            if (itemIndex > -1) {
                const item = cart.items[itemIndex];
                if (item) {
                    item.quantity += quantity;
                }
            }
            else {
                cart.items.push({ menuItemID, quantity });
            }
        }
        await cart.save();
        res.status(200).json(cart);
    }
    catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.addToCart = addToCart;
const getCart = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const cart = await cart_model_js_1.default.findOne({ userID: user.id }).populate('items.menuItemID');
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        res.status(200).json(cart);
    }
    catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getCart = getCart;
const clearCart = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const cart = await cart_model_js_1.default.findOneAndDelete({ userID: user.id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        res.status(200).json({ message: 'Cart cleared successfully' });
    }
    catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.clearCart = clearCart;
const removeFromCart = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { menuItemID } = req.body;
        if (!menuItemID) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const cart = await cart_model_js_1.default.findOne({ userID: user.id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        cart.items = cart.items.filter((item) => item.menuItemID.toString() !== menuItemID);
        await cart.save();
        res.status(200).json(cart);
    }
    catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.removeFromCart = removeFromCart;
const updateCartItemQuantity = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { menuItemID, quantity } = req.body;
        if (!menuItemID || quantity === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const cart = await cart_model_js_1.default.findOne({ userID: user.id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        const itemIndex = cart.items.findIndex((item) => item.menuItemID.toString() === menuItemID);
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }
        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
            if (cart.items.length === 0) {
                await cart_model_js_1.default.findOneAndDelete({ userID: user.id });
                return res.status(200).json({ items: [], restaurantID: null });
            }
        }
        else {
            const item = cart.items[itemIndex];
            if (item)
                item.quantity = quantity;
        }
        await cart.save();
        res.status(200).json(cart);
    }
    catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateCartItemQuantity = updateCartItemQuantity;
