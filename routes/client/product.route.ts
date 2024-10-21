import express, {Router } from "express"
import * as controller from "../../controllers/client/product.controller";
import verifyToken from "../../middlewares/client/verifyToken.middleware";


const router : Router = express.Router();

router.get("/", controller.index);

router.get("/:productId", controller.detail);

router.patch("/like/:productId",verifyToken, controller.like);

router.get("/list/favorite", verifyToken, controller.wishlist);

router.get("/list/top-sold", controller.topSold);

router.delete("/delete/favorite/:productId", verifyToken, controller.deleteFavoriteProduct);

router.post("/wishlist/add-to-cart", verifyToken, controller.addToCartFromWishlist);


export const productRoute : Router = router;