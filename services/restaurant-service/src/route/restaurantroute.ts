import express from 'express';
import { verifyJWT } from '../middleware/jwtverification.js';
import { upload } from '../middleware/multer.js';
import { addresturant } from '../controller/restaurant.js';

const router = express.Router();

router.post('/', verifyJWT, upload.single('image'), addresturant);

export default router;
