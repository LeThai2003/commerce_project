"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoute = void 0;
const express_1 = __importDefault(require("express"));
const controller = __importStar(require("../../controllers/admin/product.controller"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const uploadToCloud_1 = require("../../middlewares/admin/uploadToCloud");
const products_validate_1 = require("../../validations/admin/products.validate");
const router = express_1.default.Router();
router.get("/", controller.index);
router.get("/create", controller.create);
router.get("/:product_id", controller.detail);
router.get("/create", controller.create);
router.post("/create", upload.fields([
    { name: 'image_url', maxCount: 5 }
]), uploadToCloud_1.uploadFields, products_validate_1.createProductValidation, controller.createPost);
router.get("/edit/:product_id", controller.edit);
router.patch("/edit/:product_id", upload.fields([
    { name: 'images_multi', maxCount: 5 }
]), uploadToCloud_1.uploadFields, controller.editPost);
router.delete("/delete/:product_id", controller.del);
exports.productRoute = router;
