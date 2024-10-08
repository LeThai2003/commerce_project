import express, {Router } from "express"
import * as controller from "../../controllers/client/user.controller";

const router : Router = express.Router();

router.post("/login", controller.login);

router.post("/register", controller.register);

router.get("/verify-email", controller.verifyEmail); // xác thực email -- login

router.post("/logout", controller.logout);

router.post("/password/forgot", controller.forgotPassword);

router.get("/password/otp", controller.passwordOtp); // xác thực email -- login

router.post("/password/reset", controller.resetPassword);

export const userRoutes : Router = router;