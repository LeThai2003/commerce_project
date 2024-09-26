"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const product_route_1 = require("./product.route");
const user_route_1 = require("./user.route");
const clientRoutes = (app) => {
    app.use("/products", product_route_1.productRoute);
    app.use("/user", user_route_1.userRoutes);
};
exports.default = clientRoutes;
