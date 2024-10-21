"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToCartFromWishlist = exports.deleteFavoriteProduct = exports.wishlist = exports.topSold = exports.detail = exports.like = exports.index = void 0;
const product_model_1 = __importDefault(require("../../models/product.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const convert_to_slug_helper_1 = require("../../helpers/convert-to-slug.helper");
const pagination_helper_1 = require("../../helpers/pagination.helper");
const user_model_1 = __importDefault(require("../../models/user.model"));
const wishlist_model_1 = __importDefault(require("../../models/wishlist.model"));
const database_1 = __importDefault(require("../../configs/database"));
const comment_model_1 = __importDefault(require("../../models/comment.model"));
const cart_model_1 = __importDefault(require("../../models/cart.model"));
const cart_item_model_1 = __importDefault(require("../../models/cart_item.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let find = {
            status: "active",
            deleted: false,
        };
        const category_id = parseInt(req.query["category_id"]);
        if (category_id) {
            const category_ids = yield database_1.default.query(`
                WITH RECURSIVE category_hierarchy AS (
                SELECT category_id, parent_category_id, category_title
                FROM categories
                WHERE category_id = ${category_id}  -- danh mục gốc mà bạn click vào

                UNION ALL

                SELECT c.category_id, c.parent_category_id, c.category_title
                FROM categories c
                INNER JOIN category_hierarchy ch ON c.parent_category_id = ch.category_id
            )
            SELECT category_id from category_hierarchy
            `, {
                raw: true,
                type: sequelize_1.QueryTypes.SELECT
            });
            const just_category_ids = [];
            for (const item of category_ids) {
                just_category_ids.push(item["category_id"]);
            }
            ;
            console.log(just_category_ids);
            find["category_id"] = {
                [sequelize_1.Op.in]: just_category_ids
            };
        }
        const sort = [];
        if (req.query["sortKey"] && req.query["sortValue"]) {
            const sortKey = req.query["sortKey"];
            const sortValue = req.query["sortValue"];
            if (typeof sortValue === 'string') {
                const formattedSortValue = sortValue.toUpperCase();
                sort.push([sortKey, formattedSortValue]);
            }
            else {
                console.error('sortValue is not a string');
            }
        }
        const fromPrice = parseInt(req.query["fromPrice"]) || 0;
        const toPrice = parseInt(req.query["toPrice"]) || 0;
        if (fromPrice && toPrice) {
            find["price_unit"] = {
                [sequelize_1.Op.and]: [
                    { [sequelize_1.Op.gte]: fromPrice },
                    { [sequelize_1.Op.lte]: toPrice },
                ]
            };
        }
        if (req.query["searchKey"]) {
            const titleFromSearh = req.query["searchKey"];
            if (typeof titleFromSearh === "string") {
                let title = (0, convert_to_slug_helper_1.convertToSlug)(titleFromSearh.toLowerCase());
                find["slug"] = { [sequelize_1.Op.like]: `%${title}%` };
            }
        }
        let products = yield product_model_1.default.findAll({
            where: find,
            attributes: { exclude: ['createdAt', 'updatedAt', 'deleted', 'status'] },
            order: sort,
            raw: true,
        });
        let user = null;
        let accessToken = req.headers["authorization"];
        if (accessToken && accessToken.trim() !== "Bearer") {
            accessToken = accessToken.split(" ")[1];
            const decoded = jsonwebtoken_1.default.decode(accessToken);
            const { credential_id } = decoded;
            user = yield user_model_1.default.findOne({
                where: {
                    credential_id: credential_id
                },
                raw: true
            });
        }
        ;
        for (const item of products) {
            const newPrice = item["price_unit"] * (1 - (item["discount"] || 0) / 100);
            item["newPrice"] = newPrice;
            const countQuantitySale = yield database_1.default.query(`
                SELECT SUM(order_items.ordered_quantity) AS total_quantity_sold
                FROM orders
                JOIN payments ON orders.order_id = payments.order_id
                JOIN order_items ON order_items.order_id = orders.order_id
                WHERE payments.payment_status = 'Đã giao'
                AND order_items.product_id = ${item["product_id"]};
            `, {
                type: sequelize_1.QueryTypes.SELECT,
                raw: true
            });
            item["total_quantity_sold"] = parseInt(countQuantitySale[0]["total_quantity_sold"]) || 0;
            const ratingAVG = yield database_1.default.query(`
                SELECT AVG(rate.star) as rating 
                FROM rate
                WHERE rate.product_id = ${item["product_id"]}
            `, {
                raw: true,
                type: sequelize_1.QueryTypes.SELECT
            });
            item["rating"] = parseFloat(ratingAVG[0]["rating"]) || 0;
            if (user) {
                const existRecodeProductLike = yield wishlist_model_1.default.findOne({
                    where: {
                        product_id: item["product_id"],
                        user_id: user["user_id"]
                    }
                });
                if (existRecodeProductLike) {
                    item["like"] = true;
                }
                else {
                    item["like"] = false;
                }
            }
            else {
                item["like"] = false;
            }
        }
        let rate = req.query["rate"];
        if (rate) {
            const rateValue = parseFloat(rate);
            const productPromises = products.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                const avgRating = yield database_1.default.query(`
                    SELECT AVG(star) AS average_rating
                    FROM rate
                    WHERE product_id = ${item["product_id"]}
                `, {
                    type: sequelize_1.QueryTypes.SELECT,
                    raw: true
                });
                const averageRating = parseFloat(avgRating[0]["average_rating"]) || 0;
                if (averageRating >= rateValue) {
                    item["rating"] = parseFloat(averageRating.toFixed(1));
                    return item;
                }
                return null;
            }));
            const results = yield Promise.all(productPromises);
            products = results.filter(item => item !== null);
        }
        const countProducts = products.length;
        const objectPagination = (0, pagination_helper_1.paginationHelper)(req, countProducts);
        const paginatedProducts = products.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);
        return res.json({
            code: 200,
            data: paginatedProducts,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"],
            fromPrice: fromPrice,
            toPrice: toPrice
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: error
        });
    }
});
exports.index = index;
const like = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        let user = res.locals.user;
        const existRecord = yield wishlist_model_1.default.findOne({
            where: {
                user_id: user["user_id"],
                product_id: parseInt(productId)
            },
            raw: true
        });
        if (!existRecord) {
            yield wishlist_model_1.default.create({
                user_id: user["user_id"],
                product_id: parseInt(productId),
                like_date: new Date(Date.now())
            });
        }
        else {
            yield wishlist_model_1.default.destroy({
                where: {
                    user_id: user["user_id"],
                    product_id: parseInt(productId)
                }
            });
        }
        return res.json({
            code: 200,
            message: "Thành công!"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Thất bại " + error
        });
    }
});
exports.like = like;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        console.log("----------------------------------------");
        let accessToken = req.headers["authorization"];
        console.log("token product detail: " + accessToken);
        let like = false;
        let isCommented = false;
        const listComment = yield comment_model_1.default.findAll({
            where: {
                product_id: parseInt(productId),
                deleted: false
            },
            order: [
                ['createdAt', 'DESC']
            ],
            limit: 4,
            raw: true
        });
        for (const comment of listComment) {
            const infoUser = yield user_model_1.default.findOne({
                where: {
                    user_id: comment["user_id"],
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'deleted'],
                }
            });
            comment["infoUser"] = infoUser;
        }
        if (accessToken && accessToken.trim() !== "Bearer") {
            accessToken = accessToken.split(" ")[1];
            const decoded = jsonwebtoken_1.default.decode(accessToken);
            const { credential_id } = decoded;
            const user = yield database_1.default.query(`
                select users.user_id
                FROM users JOIN credentials on users.credential_id = credentials.credential_id
                WHERE credentials.credential_id = ${credential_id}
            `, {
                raw: true,
                type: sequelize_1.QueryTypes.SELECT
            });
            const record = yield database_1.default.query(`
                select * 
                FROM wishlist JOIN users on wishlist.user_id = users.user_id and wishlist.user_id = ${user[0]["user_id"]}
                JOIN products ON products.product_id = wishlist.product_id and wishlist.product_id = ${productId}
            `, {
                raw: true,
                type: sequelize_1.QueryTypes.SELECT
            });
            if (record) {
                like = true;
            }
            if (user) {
                const existUserComment = listComment.find(item => item["user_id"] === user[0]["user_id"]);
                if (existUserComment) {
                    isCommented = true;
                }
            }
        }
        ;
        const product = yield product_model_1.default.findOne({
            attributes: { exclude: ['createdAt', 'updatedAt', 'deleted', 'status'] },
            where: {
                product_id: productId,
            },
            raw: true
        });
        product["newPrice"] = Math.floor((product["price_unit"] * (1 - (product["discount"] || 0) / 100)));
        const countQuantitySold = yield database_1.default.query(`
            SELECT SUM(oi.ordered_quantity) AS total_quantity
            FROM order_items oi
            JOIN payments pm ON oi.order_id = pm.order_id
            WHERE oi.product_id = ${product["product_id"]}
            AND pm.payment_status = 'Đã giao';
        `, {
            raw: true,
            type: sequelize_1.QueryTypes.SELECT
        });
        const ratingAVG = yield database_1.default.query(`
            SELECT AVG(rate.star) as rating 
            FROM rate
            WHERE rate.product_id = ${product["product_id"]}
        `, {
            raw: true,
            type: sequelize_1.QueryTypes.SELECT
        });
        product["comment"] = listComment;
        return res.json({
            code: 200,
            message: "Load dữ liệu chi tiết sản phẩm thành công",
            data: product,
            quantityProductSold: parseInt(countQuantitySold[0]["total_quantity"]) || 0,
            rating: parseFloat(ratingAVG[0]["rating"]) || 0,
            like: like,
            commented: isCommented
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Load dữ liệu chi tiết sản phẩm thất bại " + error
        });
    }
});
exports.detail = detail;
const topSold = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield database_1.default.query(`
            SELECT order_items.product_id, SUM(order_items.ordered_quantity) as total_quantity_sold from 
            payments JOIN order_items on payments.order_id = order_items.order_id and payments.payment_status='Đã giao'
            JOIN products on products.product_id = order_items.product_id
            GROUP BY order_items.product_id
            ORDER BY total_quantity_sold DESC
            LIMIT 20            
        `, {
            raw: true,
            type: sequelize_1.QueryTypes.SELECT
        });
        console.log(data);
        let accessToken = req.headers["authorization"];
        let user = null;
        if (accessToken && accessToken.trim() !== "Bearer") {
            accessToken = accessToken.split(" ")[1];
            const decoded = jsonwebtoken_1.default.decode(accessToken);
            const { credential_id } = decoded;
            user = yield user_model_1.default.findOne({
                where: {
                    credential_id: credential_id
                },
                raw: true
            });
        }
        ;
        for (const item of data) {
            const productId = item["product_id"];
            item["total_quantity_sold"] = parseInt(item["total_quantity_sold"]);
            const infoProduct = yield product_model_1.default.findOne({
                where: {
                    product_id: productId,
                },
                attributes: { exclude: ['updatedAt', 'createdAt', 'deleted', 'product_id'] },
                raw: true
            });
            item["infoProduct"] = infoProduct;
            const ratingAVG = yield database_1.default.query(`
                SELECT AVG(rate.star) as rating 
                FROM rate
                WHERE rate.product_id = ${productId}
            `, {
                raw: true,
                type: sequelize_1.QueryTypes.SELECT
            });
            item["rating"] = parseFloat(ratingAVG[0]["rating"]) || 0;
            if (user) {
                const existRecodeProductLike = yield wishlist_model_1.default.findOne({
                    where: {
                        product_id: item["product_id"],
                        user_id: user["user_id"]
                    }
                });
                if (existRecodeProductLike) {
                    item["like"] = true;
                }
                else {
                    item["like"] = false;
                }
            }
            else {
                item["like"] = false;
            }
        }
        return res.json({
            code: 200,
            message: "Load dữ liệu chi tiết sản phẩm thành công",
            data: data
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Load dữ liệu chi tiết sản phẩm thất bại " + error
        });
    }
});
exports.topSold = topSold;
const wishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = res.locals.user;
        const wishlist = yield wishlist_model_1.default.findAll({
            where: {
                user_id: user["user_id"]
            },
            raw: true
        });
        let ids = wishlist.map(item => { return item["product_id"]; });
        console.log(ids);
        console.log(wishlist);
        const dataProductsWishlist = yield product_model_1.default.findAll({
            where: {
                product_id: {
                    [sequelize_1.Op.in]: ids,
                }
            },
            attributes: { exclude: ["createdAt", "updatedAt", "deleted",] },
            raw: true
        });
        const objectPagination = (0, pagination_helper_1.paginationHelper)(req, dataProductsWishlist.length);
        const paginatedProductsWishlist = dataProductsWishlist.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);
        return res.json({
            code: 200,
            message: "Thành công!",
            data: paginatedProductsWishlist,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"],
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Thất bại " + error
        });
    }
});
exports.wishlist = wishlist;
const deleteFavoriteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = res.locals.user;
        const productId = req.params.productId;
        yield wishlist_model_1.default.destroy({
            where: {
                product_id: parseInt(productId),
                user_id: user["user_id"]
            }
        });
        return res.json({
            code: 200,
            message: "Xóa sản phẩm yêu thích thành công!",
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Thất bại " + error
        });
    }
});
exports.deleteFavoriteProduct = deleteFavoriteProduct;
const addToCartFromWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = res.locals.user;
        console.log(req.body);
        const ids = req.body;
        const cart = yield cart_model_1.default.findOne({
            where: {
                user_id: user["user_id"],
            },
            raw: true
        });
        for (const id of ids) {
            const exitsItem = yield cart_item_model_1.default.findOne({
                where: {
                    cart_id: cart["cart_id"],
                    product_id: id
                }
            });
            if (exitsItem) {
                yield cart_item_model_1.default.update({
                    ordered_quantity: exitsItem["ordered_quantity"] + 1
                }, {
                    where: {
                        cart_item_id: exitsItem["cart_item_id"]
                    }
                });
            }
            else {
                yield cart_item_model_1.default.create({
                    cart_id: cart["cart_id"],
                    product_id: id,
                    ordered_quantity: 1
                });
            }
            yield wishlist_model_1.default.destroy({
                where: {
                    product_id: id
                }
            });
        }
        return res.json({
            code: 200,
            message: "Thêm sản phẩm yêu thích vào giỏ hàng thành công!",
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Thất bại " + error
        });
    }
});
exports.addToCartFromWishlist = addToCartFromWishlist;
