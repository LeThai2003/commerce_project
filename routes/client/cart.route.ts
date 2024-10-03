import express, {Router } from "express"
import * as controller from "../../controllers/client/cart.controller";

import addToCard from "../../middlewares/client/addToCart.middleware";

const router : Router = express.Router();

router.get("/", controller.index);

router.post("/add", addToCard, controller.add);

router.post("/update-quantity", controller.updateQuantity);

router.delete("/deleteItem/:cart_item_id", controller.deleteItem);


export const cartRoute : Router = router;