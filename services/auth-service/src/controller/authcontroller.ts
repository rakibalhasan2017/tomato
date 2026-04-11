import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import User from '../model/user.js';
import { Request, Response } from 'express';
import { oauth2Client } from '../config/googleconfig.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const getOAuthErrorStatus = (error: unknown): number | undefined => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { status?: number } }).response?.status === 'number'
  ) {
    return (error as { response?: { status?: number } }).response?.status;
  }

  return undefined;
};

const getOAuthErrorCode = (error: unknown): string | undefined => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error ===
      'string'
  ) {
    return (error as { response?: { data?: { error?: string } } }).response?.data?.error;
  }

  return undefined;
};

export const loginuser = async (req: Request, res: Response) => {
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
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '15d' },
    );

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
  } catch (error: unknown) {
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

export const addrole = async (req: AuthRequest, res: Response) => {
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
  } catch (error) {
    console.error('Add role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const myprofile = async (req: AuthRequest, res: Response) => {
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
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ ADD THIS - OAuth callback route (what Google redirects to)
export const googleCallback = async (req: Request, res: Response) => {
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

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '15d' },
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
  } catch (error: unknown) {
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
export const googleAuth = (req: Request, res: Response) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent',
  });
  console.log('Redirecting to Google OAuth URL:', authUrl);
  res.redirect(authUrl);
};
