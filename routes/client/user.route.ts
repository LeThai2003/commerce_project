import express, {Router } from "express"
import * as controller from "../../controllers/client/user.controller";

const router : Router = express.Router();

router.post("/login", controller.login);

router.post("/register", controller.register);

router.get("/verify-email", controller.verifyEmail);


export const userRoutes : Router = router;