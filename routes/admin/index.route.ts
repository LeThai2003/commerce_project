import { Express } from "express";
import { productRoute } from "./product.route";
import { uploadRoute } from "./upload.route";
import { categoryRoute } from "./category.route";
import { rolesRoute } from "./roles.route";
import { accountRoute } from "./account.route";
import verifyToken from "../../middlewares/admin/verifyToken.middleware"
import systemConfig from "../../configs/systemConfig";
import { blogRoute } from "./blog.route";
import { contactRoute } from "./contact.route";
import { chartReportRoute } from "./chartReport.route";
import { ordersRoute } from "./order.route";

const adminRoutes = (app : Express) : void => {

    const path = systemConfig["base_path"];

    app.use(`${path}/accounts`, accountRoute);

    app.use(verifyToken);

    app.use(`${path}/contacts`, contactRoute);

    app.use(`${path}/reports`, chartReportRoute);

    app.use(`${path}/orders`, ordersRoute);

    app.use(`${path}/blogs`, blogRoute);

    app.use(`${path}/products`, productRoute);

    app.use(`${path}/upload`, uploadRoute);

    app.use(`${path}/categories`, categoryRoute);

    app.use(`${path}/roles`, rolesRoute);
}

export default adminRoutes;

