import express from 'express';
import { uploadImage } from '../controller/uploadImage';
import { upload } from '../middleware/multer.js';
import { verifyJWT } from '../middleware/jwtverification';

const router = express.Router();

router.post('/upload', verifyJWT, upload.single('image'), uploadImage);

export default router;
