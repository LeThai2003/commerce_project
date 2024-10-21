import express, {Router } from "express";
import multer from "multer";
const upload = multer();
import { uploadFields } from "../../middlewares/admin/uploadToCloud";
import * as controller from "../../controllers/client/contact.controller";


const router : Router = express.Router();


router.post("/", controller.postContact)


export const contactRoute : Router = router;