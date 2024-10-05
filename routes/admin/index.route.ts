import { Express } from "express";
import { productRoute } from "./product.route";
import { uploadRoute } from "./upload.route";
import { categoryRoute } from "./category.route";


const adminRoutes = (app : Express) : void => {

    const path = "/admin";

    app.use(`${path}/products`, productRoute);

    app.use(`${path}/upload`, uploadRoute);

    app.use(`${path}/categories`, categoryRoute);

}

export default adminRoutes;

