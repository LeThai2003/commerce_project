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
const upload_route_1 = require("./upload.route");
const verifyToken_middleware_1 = __importDefault(require("../../middlewares/client/verifyToken.middleware"));
const address_route_1 = require("./address.route");
const comment_route_1 = require("./comment.route");
const blog_route_1 = require("./blog.route");
const contact_route_1 = require("./contact.route");
const clientRoutes = (app) => {
    app.use("/categories", category_route_1.categoryRoutes);
    app.use("/products", product_route_1.productRoute);
    app.use("/user", user_route_1.userRoutes);
    app.use("/cart", verifyToken_middleware_1.default, cart_route_1.cartRoute);
    app.use("/order", verifyToken_middleware_1.default, order_route_1.orderRoute);
    app.use("/verify-phone", verify_phone_route_1.verifyPhoneRoute);
    app.use("/account", verifyToken_middleware_1.default, account_route_1.accountRoutes);
    app.use("/rate", rate_route_1.rateRoute);
    app.use("/comment", comment_route_1.commentRoute);
    app.use("/contacts", contact_route_1.contactRoute);
    app.use("/blogs", blog_route_1.blogRoute);
    app.use(`/upload`, upload_route_1.uploadRoute);
    app.use(`/address`, verifyToken_middleware_1.default, address_route_1.addressRoute);
};
exports.default = clientRoutes;
