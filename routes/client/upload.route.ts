import express, {Router } from "express"
import * as controller from "../../controllers/client/upload.controller";

import multer from "multer";
const upload = multer();

import { uploadSingle } from "../../middlewares/admin/uploadToCloud";

const router : Router = express.Router();

router.post("/", upload.single('image_url'), uploadSingle, controller.index);


export const uploadRoute : Router = router;