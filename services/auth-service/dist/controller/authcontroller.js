import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import User from '../model/user.js';
import { oauth2Client } from '../config/googleconfig.js';
const getOAuthErrorStatus = (error) => {
    if (typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof error.response?.status === 'number') {
        return error.response?.status;
    }
    return undefined;
};
const getOAuthErrorCode = (error) => {
    if (typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof error.response?.data?.error ===
            'string') {
        return error.response?.data?.error;
    }
    return undefined;
};
export const loginuser = async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
    }
    try {
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        // Get user info using googleapis (better than axios)
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();
        const { email, name, picture } = data;
        if (!email) {
            return res.status(400).json({ error: 'Email not provided by Google' });
        }
        // Find or create user
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                email,
                name,
                image: picture, // Store Google's picture URL
            });
            await user.save();
        }
        // ✅ Create JWT with only essential data
        const token = jwt.sign({
            id: user._id.toString(),
            email: user.email,
        }, process.env.JWT_SECRET, { expiresIn: '15d' });
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                image: user.image,
                role: user.role,
            },
        });
    }
    catch (error) {
        const oauthStatus = getOAuthErrorStatus(error);
        const oauthErrorCode = getOAuthErrorCode(error);
        console.error('Google OAuth Error:', oauthErrorCode ?? 'unknown_error', oauthStatus ?? 'n/a');
        if (oauthStatus === 400) {
            return res.status(400).json({ error: 'Invalid or expired authorization code' });
        }
        res.status(500).json({ error: 'Authentication failed' });
    }
};
const allowedroles = ['customer', 'rider', 'seller'];
export const addrole = async (req, res) => {
    const { role } = req.body;
    const email = req.user?.email; // ✅ Direct access after JWT fix
    try {
        if (!email) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!role || !allowedroles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Allowed: customer, rider, seller' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.role = role;
        await user.save();
        res.status(200).json({
            message: 'Role updated successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Add role error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const myprofile = async (req, res) => {
    const email = req.user?.email; // ✅ Direct access after JWT fix
    try {
        if (!email) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        // ✅ Fetch fresh data from database
        const user = await User.findOne({ email }).select('-__v');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({
            id: user._id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            currentLocation: user.currentLocation ?? null,
        });
    }
    catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const isValidLatitude = (latitude) => latitude >= -90 && latitude <= 90;
const isValidLongitude = (longitude) => longitude >= -180 && longitude <= 180;
export const updateCurrentLocation = async (req, res) => {
    const email = req.user?.email;
    const { latitude, longitude, accuracyMeters, capturedAt, permission } = req.body;
    try {
        if (!email) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (!permission || !['granted', 'denied', 'unavailable'].includes(permission)) {
            return res.status(400).json({ error: 'Invalid permission value' });
        }
        if (permission !== 'granted') {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            user.currentLocation = {
                capturedAt: new Date(),
                source: 'browser',
                permission,
            };
            await user.save();
            return res.status(200).json({
                message: 'Location permission state stored',
                currentLocation: user.currentLocation,
            });
        }
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return res
                .status(400)
                .json({ error: 'Latitude and longitude are required for granted permission' });
        }
        if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
            return res.status(400).json({ error: 'Invalid latitude or longitude range' });
        }
        if (accuracyMeters !== undefined &&
            (typeof accuracyMeters !== 'number' || accuracyMeters < 0)) {
            return res.status(400).json({ error: 'Accuracy must be a positive number' });
        }
        const capturedAtDate = capturedAt ? new Date(capturedAt) : new Date();
        if (Number.isNaN(capturedAtDate.getTime())) {
            return res.status(400).json({ error: 'Invalid capturedAt timestamp' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.currentLocation = {
            point: { type: 'Point', coordinates: [longitude, latitude] },
            capturedAt: capturedAtDate,
            source: 'browser',
            permission,
            ...(accuracyMeters !== undefined ? { accuracyMeters } : {}),
        };
        await user.save();
        return res.status(200).json({
            message: 'Current location updated',
            currentLocation: user.currentLocation,
        });
    }
    catch (error) {
        console.error('Current location update error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
export const getCurrentLocation = async (req, res) => {
    const email = req.user?.email;
    try {
        if (!email) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const user = await User.findOne({ email }).select('currentLocation');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ currentLocation: user.currentLocation ?? null });
    }
    catch (error) {
        console.error('Current location fetch error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
// ✅ ADD THIS - OAuth callback route (what Google redirects to)
export const googleCallback = async (req, res) => {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
    }
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();
        const { email, name, picture } = data;
        if (!email) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=no_email`);
        }
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email, name, image: picture });
            await user.save();
        }
        const token = jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: '15d' });
        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
    }
    catch (error) {
        const oauthStatus = getOAuthErrorStatus(error);
        const oauthErrorCode = getOAuthErrorCode(error);
        console.error('OAuth callback error:', oauthErrorCode ?? 'unknown_error', oauthStatus ?? 'n/a');
        if (oauthStatus === 400 || oauthErrorCode === 'invalid_grant') {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
        }
        res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
};
// ✅ ADD THIS - Initiate OAuth flow
export const googleAuth = (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email'],
        prompt: 'consent',
    });
    console.log('Redirecting to Google OAuth URL:', authUrl);
    res.redirect(authUrl);
};
