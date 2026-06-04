"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwtverification_js_1 = require("../middleware/jwtverification.js");
const cart_js_1 = require("../controller/cart.js");
const router = express_1.default.Router();
router.post('/add', jwtverification_js_1.verifyJWT, cart_js_1.addToCart);
router.get('/', jwtverification_js_1.verifyJWT, cart_js_1.getCart);
router.delete('/clear', jwtverification_js_1.verifyJWT, cart_js_1.clearCart);
router.delete('/remove', jwtverification_js_1.verifyJWT, cart_js_1.removeFromCart);
router.put('/update', jwtverification_js_1.verifyJWT, cart_js_1.updateCartItemQuantity);
exports.default = router;
