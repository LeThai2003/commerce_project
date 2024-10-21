import express, {Router } from "express"
import * as controller from "../../controllers/admin/order.controller";

const router : Router = express.Router();


router.get("/", controller.index);

router.get("/status-payment", controller.statusPayment);

router.post("/status-change/:orderId/:statusId", controller.changeStatus);

export const ordersRoute : Router = router;