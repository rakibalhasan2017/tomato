"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const axios_1 = __importDefault(require("axios"));
const uploadImage = async (req, res, next) => {
    if (!req.file) {
        next();
        return;
    }
    try {
        const file = req.file;
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
        formData.append('image', blob, file.originalname);
        const headers = {};
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }
        const utilitiesUrl = process.env.UTILITIES_SERVICE_URL || 'http://localhost:5002';
        const uploadResponse = await axios_1.default.post(`${utilitiesUrl}/api/utilities/upload`, formData, {
            headers,
        });
        if (!uploadResponse.data || !uploadResponse.data.imageUrl) {
            res.status(500).json({
                error: 'Failed to upload image: Invalid response from utility service',
            });
            return;
        }
        console.log('Image uploaded successfully:', uploadResponse.data);
        req.body.imageUrl = uploadResponse.data.imageUrl;
        req.body.image = uploadResponse.data.imageUrl;
        next();
    }
    catch (uploadError) {
        console.error('Failed to upload image to utility service:', uploadError.response?.data || uploadError.message);
        res.status(uploadError.response?.status || 500).json({
            error: uploadError.response?.data?.error ||
                uploadError.response?.data?.message ||
                'Failed to upload image to utility service',
        });
        return;
    }
};
exports.uploadImage = uploadImage;
