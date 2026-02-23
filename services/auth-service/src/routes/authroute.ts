import { Router, Request, Response } from 'express';
import { loginuser, addrole } from '../controller/authcontroller.js';
import { verifyJWT } from '../middleware/jwtverification.js';

const router = Router();

router.post('/login', loginuser);
router.put('/addrole', verifyJWT, addrole);

export default router;
