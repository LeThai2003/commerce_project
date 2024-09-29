import express, {Router } from "express"
import * as controller from "../../controllers/client/cart.controller";

import addToCard from "../../middlewares/client/addToCart.middleware";

const router : Router = express.Router();

router.post("/add", addToCard, controller.add);


export const cartRoute : Router = router;