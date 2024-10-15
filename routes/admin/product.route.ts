import express, {Router } from "express"
import * as controller from "../../controllers/admin/product.controller";

import multer from "multer";
const upload = multer();

import { uploadSingle } from "../../middlewares/admin/uploadToCloud";
import { uploadFields } from "../../middlewares/admin/uploadToCloud";
import { createProductValidation } from "../../validations/admin/products.validate";

const router : Router = express.Router();

router.get("/", controller.index);

router.get("/create", controller.create);

router.get("/:product_id", controller.detail)

// router.post("/create", upload.single('thumbnail'), uploadSingle, controller.createPost);  // upload single

// router.post(
//     "/create", 
//     upload.fields([
//         { name: 'thumbnail', maxCount: 1 }, 
//         { name: 'avatar', maxCount: 1 }
//     ]), 
//     uploadFields, 
//     controller.createPost2
// );  // upload fields

// router.post(
//     "/create", 
//     upload.fields([
//         { name: 'images_multi', maxCount: 5}
//     ]), 
//     uploadFields, 
//     controller.createPost3
//);  // upload input multiple


router.get("/create", controller.create);

router.post(
    "/create",
    // upload.single('image_url'), 
    // uploadSingle, 
    upload.fields([
        { name: 'image_url', maxCount: 5}
    ]), 
    uploadFields, 
    createProductValidation,
    controller.createPost
)

router.get("/edit/:product_id", controller.edit);

router.patch(
    "/edit/:product_id",
    // upload.single('image_url'), 
    // uploadSingle,
    upload.fields([
        { name: 'images_multi', maxCount: 5}
    ]),
    uploadFields, 
    controller.editPost
)

router.delete("/delete/:product_id", controller.del);


export const productRoute : Router = router;