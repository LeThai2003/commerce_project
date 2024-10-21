import express, {Router } from "express"
import * as controller from "../../controllers/client/user.controller";
import { forgotPasswordValidation, loginValidation, registerValidation, resetPasswordValidation } from "../../validations/client/user.validation";
import verifyToken from "../../middlewares/client/verifyToken.middleware";

const router : Router = express.Router();

router.post("/login", loginValidation, controller.login);

router.post(
    "/register", 
    registerValidation, 
    controller.register
);

router.get("/verify-email", controller.verifyEmail); // xác thực email -- login

router.post("/logout", controller.logout);

router.post("/password/forgot", forgotPasswordValidation, controller.forgotPassword);

router.post("/password/otp", controller.passwordOtp); // xác thực email -- forgot pass

router.post("/password/reset", resetPasswordValidation, controller.resetPassword);

router.post("/refresh-token", controller.refreshToken);

export const userRoutes : Router = router;