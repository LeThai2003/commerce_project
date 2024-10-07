import { Express } from "express";
import { productRoute } from "./product.route";
import { uploadRoute } from "./upload.route";
import { categoryRoute } from "./category.route";
import { rolesRoute } from "./roles.route";
import { accountRoute } from "./account.route";
import verifyToken from "../../middlewares/admin/verifyToken.middleware"

const adminRoutes = (app : Express) : void => {

    const path = "/admin";

    app.use(verifyToken);

    app.use(`${path}/products`, productRoute);

    app.use(`${path}/upload`, uploadRoute);

    app.use(`${path}/categories`, categoryRoute);

    app.use(`${path}/roles`, rolesRoute);

    app.use(`${path}/accounts`, accountRoute);

    

}

export default adminRoutes;

