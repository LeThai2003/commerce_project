import express, {Router } from "express"
import * as controller from "../../controllers/admin/blog.controller";

import multer from "multer";
const upload = multer();

import { uploadFields } from "../../middlewares/admin/uploadToCloud";
import { uploadSingle } from "../../middlewares/admin/uploadToCloud";
import verifyToken from "../../middlewares/admin/verifyToken.middleware";

const router : Router = express.Router();

router.get("/", verifyToken, controller.index);

router.get("/detail/:blog_id", controller.detail);

router.post(
    "/create", 
    upload.fields([
        { name: 'image_url', maxCount: 5}
    ]),
    uploadFields, 
    controller.createPost
);

router.patch(
    "/edit/:blog_id", 
    upload.fields([
        { name: 'image_url', maxCount: 5}
    ]),
    uploadFields, 
    controller.editPatch
);

router.delete("/delete/:blog_id", controller.deleteBlog);

export const blogRoute : Router = router;