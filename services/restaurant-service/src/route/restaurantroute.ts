import express from 'express';
import { verifyJWT } from '../middleware/jwtverification.js';
import { addresturant, getmyrestaurant, updateresturant } from '../controller/restaurant.js';
import { isseller } from '../middleware/isseller.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

router.post('/addnew', verifyJWT, isseller, upload.single('image'), addresturant);
router.get('/myrestaurant', verifyJWT, isseller, getmyrestaurant);
router.put('/update/', verifyJWT, isseller, upload.single('image'), updateresturant);

export default router;
