"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_route_1 = require("./product.route");
const user_route_1 = require("./user.route");
const cart_route_1 = require("./cart.route");
const order_route_1 = require("./order.route");
const verify_phone_route_1 = require("./verify_phone.route");
const account_route_1 = require("./account.route");
const category_route_1 = require("./category.route");
const rate_route_1 = require("./rate.route");
const verifyToken_middleware_1 = __importDefault(require("../../middlewares/client/verifyToken.middleware"));
const clientRoutes = (app) => {
    app.use("/categories", category_route_1.categoryRoutes);
    app.use("/products", product_route_1.productRoute);
    app.use("/user", user_route_1.userRoutes);
    app.use("/cart", verifyToken_middleware_1.default, cart_route_1.cartRoute);
    app.use("/order", verifyToken_middleware_1.default, order_route_1.orderRoute);
    app.use("/verify-phone", verifyToken_middleware_1.default, verify_phone_route_1.verifyPhoneRoute);
    app.use("/account", verifyToken_middleware_1.default, account_route_1.accountRoutes);
    app.use("/rate", verifyToken_middleware_1.default, rate_route_1.rateRoute);
};
exports.default = clientRoutes;
