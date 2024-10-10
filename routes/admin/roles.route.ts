import express, {Router } from "express"
import * as controller from "../../controllers/admin/role.controller";
import verifyToken from "../../middlewares/admin/verifyToken.middleware";


const router : Router = express.Router();

router.use(verifyToken);

router.get("/", controller.index);

router.post("/create", controller.create);

router.get("/edit/:role_id", controller.edit);

router.patch("/edit/:role_id", controller.editPatch);

router.patch("/permissions", controller.editPermission);

export const rolesRoute : Router = router;