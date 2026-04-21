import { Router } from 'express';

import {
  addrole,
  myprofile,
  googleAuth, 
  googleCallback,
} from '../controller/authcontroller.js';

import { updateCurrentLocation, getCurrentLocation } from '../controller/locationcontroller.js';
import { verifyJWT } from '../middleware/jwtverification.js';

const router = Router();

router.get('/google', googleAuth); // Initiate OAuth

router.get('/google/callback', googleCallback); // Google redirects here

router.put('/addrole', verifyJWT, addrole);

router.get('/me', verifyJWT, myprofile);

router.put('/location', verifyJWT, updateCurrentLocation);

router.get('/location', verifyJWT, getCurrentLocation);

export default router;
