"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwtverification_js_1 = require("../middleware/jwtverification.js");
const restaurant_js_1 = require("../controller/restaurant.js");
const isseller_js_1 = require("../middleware/isseller.js");
const multer_js_1 = require("../middleware/multer.js");
const uploadImage_js_1 = require("../middleware/uploadImage.js");
const router = express_1.default.Router();
router.post('/addnew', jwtverification_js_1.verifyJWT, isseller_js_1.isseller, multer_js_1.upload.single('image'), uploadImage_js_1.uploadImage, restaurant_js_1.addresturant);
router.get('/myrestaurant', jwtverification_js_1.verifyJWT, isseller_js_1.isseller, restaurant_js_1.getmyrestaurant);
router.put('/update/', jwtverification_js_1.verifyJWT, isseller_js_1.isseller, multer_js_1.upload.single('image'), uploadImage_js_1.uploadImage, restaurant_js_1.updateresturant);
exports.default = router;
