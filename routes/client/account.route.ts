import express, {Router } from "express";
import * as controller from "../../controllers/client/account.controller";

import multer from "multer";
const upload = multer();

import { uploadSingle } from "../../middlewares/admin/uploadToCloud";

const router : Router = express.Router();

router.get("/", controller.index);

router.put(
    "/edit", 
    controller.edit
);

export const accountRoutes : Router = router;