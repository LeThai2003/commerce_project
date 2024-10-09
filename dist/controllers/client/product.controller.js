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
exports.detail = exports.like = exports.index = void 0;
const product_model_1 = __importDefault(require("../../models/product.model"));
const sequelize_1 = require("sequelize");
const convert_to_slug_helper_1 = require("../../helpers/convert-to-slug.helper");
const pagination_helper_1 = require("../../helpers/pagination.helper");
const user_model_1 = __importDefault(require("../../models/user.model"));
const wishlist_model_1 = __importDefault(require("../../models/wishlist.model"));
const database_1 = __importDefault(require("../../configs/database"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.query);
        let find = {
            status: "active",
            deleted: false,
        };
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
        if (req.query["fromPrice"] && req.query["toPrice"]) {
            const fromPriceQuery = req.query["fromPrice"];
            const toPriceQuery = req.query["toPrice"];
            if (typeof fromPriceQuery === 'string' && typeof toPriceQuery === 'string') {
                let price1 = parseInt(fromPriceQuery);
                let price2 = parseInt(toPriceQuery);
                find["price_unit"] = {
                    [sequelize_1.Op.and]: [
                        { [sequelize_1.Op.gte]: price1 },
                        { [sequelize_1.Op.lte]: price2 },
                    ]
                };
            }
        }
        if (req.query["searchKey"]) {
            const titleFromSearh = req.query["searchKey"];
            if (typeof titleFromSearh === "string") {
                let title = (0, convert_to_slug_helper_1.convertToSlug)(titleFromSearh.toLowerCase());
                find["slug"] = { [sequelize_1.Op.like]: `%${title}%` };
            }
        }
        const countProducts = yield product_model_1.default.count({
            where: find
        });
        const objectPagination = (0, pagination_helper_1.paginationHelper)(req, countProducts);
        const products = yield product_model_1.default.findAll({
            where: find,
            attributes: { exclude: ['createdAt', 'updatedAt', 'deleted', 'status'] },
            order: sort,
            limit: objectPagination["limit"],
            offset: objectPagination["offset"],
            raw: true,
        });
        for (const item of products) {
            const newPrice = item["price_unit"] * (1 - item["discount"] / 100);
            item["newPrice"] = newPrice.toFixed(0);
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
        }
        console.log(products);
        return res.json({
            code: 200,
            data: products,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"]
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: error
        });
    }
});
exports.index = index;
const like = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const credential_id = req["credential_id"];
        const isLike = req.params["type"];
        let user = res.locals.user;
        if (!user) {
            user = yield user_model_1.default.findOne({
                where: {
                    credential_id: credential_id
                },
                raw: true
            });
        }
        if (isLike === "yes") {
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
        const product = yield product_model_1.default.findOne({
            attributes: { exclude: ['createdAt', 'updatedAt', 'deleted', 'status'] },
            where: {
                product_id: productId,
            },
            raw: true
        });
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
        return res.json({
            code: 200,
            message: "Load dữ liệu chi tiết sản phẩm thành công",
            data: product,
            quantityProductSold: parseInt(countQuantitySold[0]["total_quantity"]) || 0,
            rating: parseFloat(ratingAVG[0]["rating"]) || 0
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
