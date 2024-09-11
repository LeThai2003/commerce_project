import { Express } from "express";
import { productRoute } from "./product.route";


const clientRoutes = (app : Express) : void => {

    app.use("/product", productRoute);

}

export default clientRoutes;

