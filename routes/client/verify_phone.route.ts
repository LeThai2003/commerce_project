import express, {Router } from "express"
import * as controller from "../../controllers/client/verify_phone.controller";

const router : Router = express.Router();

router.post("/sendOTP", controller.sendOTP);

router.post("/verifyOTP", controller.verifyOTP);


export const verifyPhoneRoute : Router = router;