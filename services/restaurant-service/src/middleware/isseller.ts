import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const isseller = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized: No user information found' });
    return;
  }
  if (user.role != 'seller') {
    res.status(403).json({ error: 'Forbidden: User is not a seller' });
    return;
  }
  next();
};
