import express, {Router } from "express"
import * as controller from "../../controllers/admin/product.controller";

import multer from "multer";
const upload = multer();

import { uploadSingle } from "../../middlewares/admin/uploadToCloud";

const router : Router = express.Router();

router.get("/create", controller.create);

router.post("/create", upload.single('thumbnail'), uploadSingle, controller.createPost);


export const productRoute : Router = router;