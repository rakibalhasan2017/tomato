"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadImage_1 = require("../controller/uploadImage");
const multer_js_1 = require("../middleware/multer.js");
const jwtverification_1 = require("../middleware/jwtverification");
const router = express_1.default.Router();
router.post('/upload', jwtverification_1.verifyJWT, multer_js_1.upload.single('image'), uploadImage_1.uploadImage);
exports.default = router;
