"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addresturant = void 0;
const axios_1 = __importDefault(require("axios"));
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
            const headers = {};
            if (req.headers.authorization) {
                headers['Authorization'] = req.headers.authorization;
            }
            const utilitiesUrl = process.env.UTILITIES_SERVICE_URL || 'http://localhost:5002';
            const uploadResponse = await axios_1.default.post(`${utilitiesUrl}/api/upload/image`, formData, {
                headers,
            });
            if (!uploadResponse.data || !uploadResponse.data.imageUrl) {
                return res.status(500).json({
                    error: 'Failed to upload image: Invalid response from utility service',
                });
            }
            imageUrl = uploadResponse.data.imageUrl;
        }
        catch (uploadError) {
            console.error('Failed to upload image to utility service:', uploadError.response?.data || uploadError.message);
            return res.status(uploadError.response?.status || 500).json({
                error: uploadError.response?.data?.error ||
                    uploadError.response?.data?.message ||
                    'Failed to upload image to utility service',
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
