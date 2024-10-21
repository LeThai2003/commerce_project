import express, {Router } from "express"
import * as controller from "../../controllers/admin/account.controller";

import multer from "multer";
const upload = multer();

import { uploadSingle } from "../../middlewares/admin/uploadToCloud";
import verifyToken from "../../middlewares/admin/verifyToken.middleware";

const router : Router = express.Router();

router.get("/", controller.index);

router.post("/login", controller.login);

router.post("/password/forgot", controller.forgotPassword);

router.post("/password/reset", controller.resetPassword);

router.use(verifyToken);

router.get("/detail", controller.detail);

router.patch("/edit", controller.editAccountPost);

router.get("/create", controller.getCreate);

router.post("/create", upload.single('image_url'), uploadSingle, controller.createPost);

router.post("/logout", controller.logout);

router.post("/reset-defautl-password/:admin_id", controller.resetDefaultPassword);

router.delete("/delete/:admin_id", controller.deleteAccount);

export const accountRoute : Router = router;