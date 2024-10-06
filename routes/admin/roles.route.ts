import express, {Router } from "express"
import * as controller from "../../controllers/admin/role.controller";


const router : Router = express.Router();

router.get("/", controller.index);

router.post("/create", controller.create);

router.get("/edit/:role_id", controller.edit);

router.patch("/edit/:role_id", controller.editPatch);

router.patch("/permissions", controller.editPermission);

export const rolesRoute : Router = router;