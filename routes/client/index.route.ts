import { Express } from "express";
import { productRoute } from "./product.route";
import { userRoutes } from "./user.route";

import verifyToken from "../../middlewares/client/verifyToken.middleware";


const clientRoutes = (app : Express) : void => {

    app.use("/products", verifyToken, productRoute);

    app.use("/user", userRoutes);

}

export default clientRoutes;

