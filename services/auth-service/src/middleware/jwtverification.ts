import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: jwt.JwtPayload;
}

export const verifyJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided in the jwt verification middleware' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded as jwt.JwtPayload;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token in the jwt verification middleware' });
  }
};
