import express, {Router } from "express"
import * as controller from "../../controllers/admin/account.controller";

import multer from "multer";
const upload = multer();

import { uploadSingle } from "../../middlewares/admin/uploadToCloud";

const router : Router = express.Router();

router.get("/", controller.index);

router.get("/create", controller.getCreate);

router.post("/create", upload.single('image_url'), uploadSingle, controller.createPost);

router.post("/login", controller.login);

export const accountRoute : Router = router;