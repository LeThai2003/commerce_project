import express, {Router } from "express"
import * as controller from "../../controllers/admin/category.controller";

import multer from "multer";
const upload = multer();

import { uploadSingle } from "../../middlewares/admin/uploadToCloud";
import { createProductValidation } from "../../validations/admin/products.validate";

const router : Router = express.Router();

router.get("/create", controller.create);

router.post(
    "/create", 
    upload.single('image_url'), 
    uploadSingle, 
    controller.createPost
);

router.get("/edit/:category_id", controller.edit);

router.patch(
    "/edit/:category_id", 
    upload.single('image_url'), 
    uploadSingle, 
    controller.editPatch
);

router.delete("/delete/:category_id", controller.del);

export const categoryRoute : Router = router;