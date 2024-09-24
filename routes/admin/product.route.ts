import express, {Router } from "express"
import * as controller from "../../controllers/admin/product.controller";

import multer from "multer";
const upload = multer();

import { uploadSingle } from "../../middlewares/admin/uploadToCloud";
import { uploadFields } from "../../middlewares/admin/uploadToCloud";

const router : Router = express.Router();

router.get("/create", controller.create);

// router.post("/create", upload.single('thumbnail'), uploadSingle, controller.createPost);  // upload single

router.post(
    "/create", 
    upload.fields([
        { name: 'thumbnail', maxCount: 1 }, 
        { name: 'avatar', maxCount: 1 }
    ]), 
    uploadFields, 
    controller.createPost2
);  // upload fields


export const productRoute : Router = router;