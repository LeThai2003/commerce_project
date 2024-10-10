import express, {Router } from "express"
import * as controller from "../../controllers/client/category.controller";

const router : Router = express.Router();

router.get("/", controller.index);

router.get("/get-price", controller.getPrice);

router.get("/:category_id", controller.getProductCategory);

export const categoryRoutes : Router = router;