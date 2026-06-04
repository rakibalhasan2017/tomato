"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gettheresturant = exports.nearbyresturant = exports.updateresturant = exports.getmyrestaurant = exports.addresturant = void 0;
const restaurant_js_1 = __importDefault(require("../model/restaurant.js"));
const addresturant = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const existingResturant = await restaurant_js_1.default.findOne({
            owenerID: user.id,
        });
        if (existingResturant) {
            return res.status(400).json({ error: 'User already owns a restaurant' });
        }
        const { name, description, phonenumber, latitude, longitude, formattedAddress } = req.body;
        if (!name ||
            !phonenumber ||
            latitude === undefined ||
            longitude === undefined ||
            !formattedAddress) {
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
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
            formattedAddress: String(formattedAddress),
        };
        const newRestaurant = await restaurant_js_1.default.create({
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
    }
    catch (error) {
        console.error('Add restaurant error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.addresturant = addresturant;
const getmyrestaurant = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const restaurant = await restaurant_js_1.default.findOne({ owenerID: user.id });
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found for this user' });
        }
        return res.status(200).json({ restaurant });
    }
    catch (error) {
        console.error('Get restaurants error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getmyrestaurant = getmyrestaurant;
const updateresturant = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const restaurant = await restaurant_js_1.default.findOne({ owenerID: user.id });
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found for this user' });
        }
        const { name, description, phonenumber, latitude, longitude, formattedAddress, imageUrl, status } = req.body;
        const updateFields = {
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
                type: 'Point',
                coordinates: [Number(longitude), Number(latitude)],
                formattedAddress: String(formattedAddress),
            };
        }
        const updatedRestaurant = await restaurant_js_1.default.findOneAndUpdate({ owenerID: user.id }, updateFields, { new: true });
        return res.status(200).json({
            message: 'Restaurant updated successfully',
            restaurant: updatedRestaurant,
        });
    }
    catch (error) {
        console.error('Update restaurant error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateresturant = updateresturant;
const nearbyresturant = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        if (latitude === undefined ||
            longitude === undefined ||
            isNaN(Number(latitude)) ||
            isNaN(Number(longitude))) {
            return res.status(400).json({ error: 'Missing or invalid latitude/longitude query parameters' });
        }
        const nearbyRestaurants = await restaurant_js_1.default.find({
            autolocation: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [Number(longitude), Number(latitude)],
                    },
                    $maxDistance: 5000,
                },
            },
        });
        return res.status(200).json({ restaurants: nearbyRestaurants });
    }
    catch (error) {
        console.error('Get nearby restaurants error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.nearbyresturant = nearbyresturant;
const gettheresturant = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await restaurant_js_1.default.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        return res.status(200).json({ restaurant });
    }
    catch (error) {
        console.error('Get restaurant error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.gettheresturant = gettheresturant;
