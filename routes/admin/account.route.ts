import express, {Router } from "express"
import * as controller from "../../controllers/admin/account.controller";

import multer from "multer";
const upload = multer();

import { uploadSingle } from "../../middlewares/admin/uploadToCloud";

const router : Router = express.Router();

router.post("/", upload.single('file'), uploadSingle, controller.index);


export const accountRoute : Router = router;