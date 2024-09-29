"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_route_1 = require("./product.route");
const user_route_1 = require("./user.route");
const cart_route_1 = require("./cart.route");
const verifyToken_middleware_1 = __importDefault(require("../../middlewares/client/verifyToken.middleware"));
const clientRoutes = (app) => {
    app.use("/products", product_route_1.productRoute);
    app.use("/user", user_route_1.userRoutes);
    app.use("/cart", verifyToken_middleware_1.default, cart_route_1.cartRoute);
};
exports.default = clientRoutes;
