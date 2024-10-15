import express, {Router } from "express"
import * as controller from "../../controllers/client/rate.controller";

import verifyToken from "../../middlewares/client/verifyToken.middleware";

const router : Router = express.Router();

router.patch("/:productId/:rate", verifyToken, controller.index);

router.get("/top-rate", controller.topRate)


export const rateRoute : Router = router;