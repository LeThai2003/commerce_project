import { Express } from "express";
import { productRoute } from "./product.route";
import { userRoutes } from "./user.route";
import { cartRoute } from "./cart.route";

import verifyToken from "../../middlewares/client/verifyToken.middleware";


const clientRoutes = (app : Express) : void => {

    app.use("/products", productRoute);

    app.use("/user", userRoutes);

    app.use("/cart", verifyToken, cartRoute);
}

export default clientRoutes;

