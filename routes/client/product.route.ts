import express, {Router } from "express"
import * as controller from "../../controllers/client/product.controller";
import verifyToken from "../../middlewares/client/verifyToken.middleware";


const router : Router = express.Router();

router.get("/", controller.index);

router.get("/:productId", controller.detail);

router.patch("/like/:type/:productId",verifyToken, controller.like);

router.get("/list/favorite", verifyToken, controller.wishlist);


export const productRoute : Router = router;