"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwtverification_js_1 = require("../middleware/jwtverification.js");
const multer_js_1 = require("../middleware/multer.js");
const restaurant_js_1 = require("../controller/restaurant.js");
const router = express_1.default.Router();
router.post('/', jwtverification_js_1.verifyJWT, multer_js_1.upload.single('image'), restaurant_js_1.addresturant);
exports.default = router;
