"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_route_1 = require("./product.route");
const upload_route_1 = require("./upload.route");
const category_route_1 = require("./category.route");
const roles_route_1 = require("./roles.route");
const account_route_1 = require("./account.route");
const verifyToken_middleware_1 = __importDefault(require("../../middlewares/admin/verifyToken.middleware"));
const systemConfig_1 = __importDefault(require("../../configs/systemConfig"));
const blog_route_1 = require("./blog.route");
const adminRoutes = (app) => {
    const path = systemConfig_1.default["base_path"];
    app.use(`${path}/accounts`, account_route_1.accountRoute);
    app.use(`${path}/blogs`, blog_route_1.blogRoute);
    app.use(verifyToken_middleware_1.default);
    app.use(`${path}/products`, product_route_1.productRoute);
    app.use(`${path}/upload`, upload_route_1.uploadRoute);
    app.use(`${path}/categories`, category_route_1.categoryRoute);
    app.use(`${path}/roles`, roles_route_1.rolesRoute);
};
exports.default = adminRoutes;
