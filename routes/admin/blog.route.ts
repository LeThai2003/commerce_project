import express, {Router } from "express"
import * as controller from "../../controllers/admin/blog.controller";

import multer from "multer";
const upload = multer();

import { uploadFields } from "../../middlewares/admin/uploadToCloud";
import { uploadSingle } from "../../middlewares/admin/uploadToCloud";

const router : Router = express.Router();

router.get("/", controller.index);

router.post(
    "/create", 
    upload.fields([
        { name: 'image_url', maxCount: 5}
    ]),
    uploadFields, 
    controller.createPost
);


export const blogRoute : Router = router;