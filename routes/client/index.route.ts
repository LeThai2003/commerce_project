import { Express } from "express";
import { productRoute } from "./product.route";
import { userRoutes } from "./user.route";


const clientRoutes = (app : Express) : void => {

    app.use("/product", productRoute);

    app.use("/user", userRoutes);

}

export default clientRoutes;

