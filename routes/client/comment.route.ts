import express, {Router } from "express";
import multer from "multer";
const upload = multer();
import { uploadFields } from "../../middlewares/admin/uploadToCloud";
import * as controller from "../../controllers/client/comment.controller";
import verifyToken from "../../middlewares/client/verifyToken.middleware";


const router : Router = express.Router();

router.post(
    "/:productId", 
    verifyToken, 
    upload.fields([
        { name: 'image_url', maxCount: 5}
    ]), 
    uploadFields, 
    controller.postComment
);

router.get("/:productId", controller.listComment)


export const commentRoute : Router = router;