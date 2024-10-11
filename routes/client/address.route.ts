import express, {Router } from "express"
import * as controller from "../../controllers/client/address.controller";
import verifyToken from "../../middlewares/client/verifyToken.middleware";


const router : Router = express.Router();

router.get("/", controller.index);

router.post("/add", controller.addAddress);

router.patch("/set-default/:address_id", controller.setDefaultAddess);


export const addressRoute : Router = router;