"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const product_route_1 = require("./product.route");
const upload_route_1 = require("./upload.route");
const category_route_1 = require("./category.route");
const roles_route_1 = require("./roles.route");
const adminRoutes = (app) => {
    const path = "/admin";
    app.use(`${path}/products`, product_route_1.productRoute);
    app.use(`${path}/upload`, upload_route_1.uploadRoute);
    app.use(`${path}/categories`, category_route_1.categoryRoute);
    app.use(`${path}/roles`, roles_route_1.rolesRoute);
};
exports.default = adminRoutes;
