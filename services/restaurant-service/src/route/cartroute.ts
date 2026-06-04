import express from 'express';
import { verifyJWT } from '../middleware/jwtverification.js';
import { addToCart, getCart, clearCart, removeFromCart, updateCartItemQuantity } from '../controller/cart.js';

const router = express.Router();

router.post('/add', verifyJWT, addToCart);
router.get('/', verifyJWT, getCart);
router.delete('/clear', verifyJWT, clearCart);
router.delete('/remove', verifyJWT, removeFromCart);
router.put('/update', verifyJWT, updateCartItemQuantity);
export default router;
