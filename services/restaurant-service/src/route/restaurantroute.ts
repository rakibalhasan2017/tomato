import express from 'express';
import { verifyJWT } from '../middleware/jwtverification.js';
import { addresturant, getmyrestaurant, updateresturant, nearbyresturant } from '../controller/restaurant.js';
import { isseller } from '../middleware/isseller.js';
import { upload } from '../middleware/multer.js';
import { uploadImage } from '../middleware/uploadImage.js';

const router = express.Router();

router.post('/addnew', verifyJWT, isseller, upload.single('image'), uploadImage, addresturant);
router.get('/myrestaurant', verifyJWT, isseller, getmyrestaurant);
router.put('/update/', verifyJWT, isseller, upload.single('image'), uploadImage, updateresturant);
router.get('/nearby', nearbyresturant);

export default router;
