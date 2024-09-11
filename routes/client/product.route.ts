import express, {Router } from "express"
import * as controller from "../../controllers/client/product.controller";

const router : Router = express.Router();

router.get("/", controller.index);


export const productRoute : Router = router;