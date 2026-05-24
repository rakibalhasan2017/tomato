"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const cloudinary_js_1 = __importDefault(require("../config/cloudinary.js"));
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Convert buffer -> base64
        const base64 = req.file.buffer.toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${base64}`;
        const result = await cloudinary_js_1.default.uploader.upload(dataURI, {
            folder: 'tomato',
        });
        return res.status(200).json({
            success: true,
            imageUrl: result.secure_url,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Image upload failed',
        });
    }
};
exports.uploadImage = uploadImage;
