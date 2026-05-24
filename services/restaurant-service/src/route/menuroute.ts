import express from 'express';
import { verifyJWT } from '../middleware/jwtverification.js';
import { isseller } from '../middleware/isseller.js';
import { addmenuitem, getmenuitem, deletemenuitem, updatemenuitem } from '../controller/menuitem.js';
import { upload } from '../middleware/multer.js';
import { uploadImage } from '../middleware/uploadImage.js';

const router = express.Router();

router.post('/addmenuitem', verifyJWT, isseller, upload.single('image'), uploadImage, addmenuitem);
router.get('/getmenuitem', verifyJWT, isseller, getmenuitem);
router.delete('/deletemenuitem/:id', verifyJWT, isseller, deletemenuitem);
router.put('/updatemenuitem/:id', verifyJWT, isseller, upload.single('image'), uploadImage, updatemenuitem);

export default router;  