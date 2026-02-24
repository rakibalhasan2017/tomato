import { Router } from 'express';
import { loginuser, addrole, myprofile, googleAuth, // ✅ Add this
googleCallback, // ✅ Add this
 } from '../controller/authcontroller.js';
import { verifyJWT } from '../middleware/jwtverification.js';
const router = Router();
// ✅ OAuth flow routes
router.get('/google', googleAuth); // Initiate OAuth
router.get('/google/callback', googleCallback); // Google redirects here
// Existing routes
router.post('/login', loginuser); // For mobile/direct code exchange
router.put('/addrole', verifyJWT, addrole);
router.get('/me', verifyJWT, myprofile);
export default router;
