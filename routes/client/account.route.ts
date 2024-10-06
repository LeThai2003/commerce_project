import express, {Router } from "express";
import * as controller from "../../controllers/client/account.controller";

import multer from "multer";
const upload = multer();

import { uploadSingle } from "../../middlewares/admin/uploadToCloud";

const router : Router = express.Router();

router.get("/", controller.index);

router.patch(
    "/edit", 
    upload.single('image_url'), 
    uploadSingle, 
    controller.edit
);

export const accountRoutes : Router = router;