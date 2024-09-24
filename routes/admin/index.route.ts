import { Express } from "express";
import { productRoute } from "./product.route";
import { uploadRoute } from "./upload.route";


const adminRoutes = (app : Express) : void => {

    const path = "/admin";

    app.use(`${path}/products`, productRoute);

    app.use(`${path}/upload`, uploadRoute);

}

export default adminRoutes;

