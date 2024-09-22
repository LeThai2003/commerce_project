import { Express } from "express";
import { productRoute } from "./product.route";




const adminRoutes = (app : Express) : void => {

    const path = "/admin";

    app.use(`${path}/products`, productRoute);

}

export default adminRoutes;

