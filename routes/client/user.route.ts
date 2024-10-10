import express, {Router } from "express"
import * as controller from "../../controllers/client/user.controller";
import { forgotPasswordValidation, loginValidation, registerValidation, resetPasswordValidation } from "../../validations/admin/user.validation";

const router : Router = express.Router();

router.post("/login", loginValidation, controller.login);

router.post("/register", registerValidation, controller.register);

router.get("/verify-email", controller.verifyEmail); // xác thực email -- login

router.post("/logout", controller.logout);

router.post("/password/forgot", forgotPasswordValidation, controller.forgotPassword);

router.get("/password/otp", controller.passwordOtp); // xác thực email -- forgot pass

router.post("/password/reset", resetPasswordValidation, controller.resetPassword);

export const userRoutes : Router = router;