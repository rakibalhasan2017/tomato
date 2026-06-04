"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwtverification_js_1 = require("../middleware/jwtverification.js");
const isseller_js_1 = require("../middleware/isseller.js");
const menuitem_js_1 = require("../controller/menuitem.js");
const multer_js_1 = require("../middleware/multer.js");
const uploadImage_js_1 = require("../middleware/uploadImage.js");
const router = express_1.default.Router();
router.post('/addmenuitem', jwtverification_js_1.verifyJWT, isseller_js_1.isseller, multer_js_1.upload.single('image'), uploadImage_js_1.uploadImage, menuitem_js_1.addmenuitem);
router.get('/getmenuitem', jwtverification_js_1.verifyJWT, isseller_js_1.isseller, menuitem_js_1.getmenuitem);
router.delete('/deletemenuitem/:id', jwtverification_js_1.verifyJWT, isseller_js_1.isseller, menuitem_js_1.deletemenuitem);
router.put('/updatemenuitem/:id', jwtverification_js_1.verifyJWT, isseller_js_1.isseller, multer_js_1.upload.single('image'), uploadImage_js_1.uploadImage, menuitem_js_1.updatemenuitem);
router.get('/restaurant/:restaurantId', jwtverification_js_1.verifyJWT, menuitem_js_1.getMenuItemsByRestaurant);
exports.default = router;
