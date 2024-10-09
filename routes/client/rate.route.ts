import express, {Router } from "express"
import * as controller from "../../controllers/client/rate.controller";


const router : Router = express.Router();

router.patch("/:productId/:rate", controller.index);


export const rateRoute : Router = router;