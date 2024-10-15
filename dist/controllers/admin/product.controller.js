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
exports.del = exports.editPost = exports.edit = exports.createPost = exports.create = exports.detail = exports.index = void 0;
const category_model_1 = __importDefault(require("../../models/category.model"));
const create_tree_helper_1 = require("../../helpers/create-tree.helper");
const product_model_1 = __importDefault(require("../../models/product.model"));
const pagination_helper_1 = require("../../helpers/pagination.helper");
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../configs/database"));
const convert_to_slug_helper_1 = require("../../helpers/convert-to-slug.helper");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let find = {
            status: "active",
            deleted: false,
        };
        let category_id = req.query["category_id"];
        if (category_id) {
            let ids = yield database_1.default.query(`
                WITH RECURSIVE category_hierarchy AS (
                    SELECT category_id, parent_category_id, category_title
                    FROM categories
                    WHERE category_id = ${parseInt(category_id)} 
    
                    UNION ALL
    
                    SELECT c.category_id, c.parent_category_id, c.category_title
                    FROM categories c
                    INNER JOIN category_hierarchy ch ON c.parent_category_id = ch.category_id
                )
                SELECT p.product_id
                FROM products p
                WHERE p.category_id IN (SELECT category_id FROM category_hierarchy);
            `, {
                raw: true,
                type: sequelize_1.QueryTypes.SELECT
            });
            ids = ids.map(item => { return item["product_id"]; });
            find["product_id"] = {
                [sequelize_1.Op.in]: ids
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
        console.log("----------------------------------------");
        for (const item of products) {
            const newPrice = item["price_unit"] * (1 - item["discount"] / 100);
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
            console.log(parseFloat(ratingAVG[0]["rating"]));
            item["rating"] = parseFloat(ratingAVG[0]["rating"]) || 0;
        }
        const countProducts = products.length;
        const objectPagination = (0, pagination_helper_1.paginationHelper)(req, countProducts);
        const paginatedProducts = products.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);
        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            data: paginatedProducts,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"],
            fromPrice: fromPrice,
            toPrice: toPrice
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi load create category"
        });
    }
});
exports.index = index;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product_id = req.params.product_id;
        const product = yield product_model_1.default.findOne({
            where: {
                product_id: product_id,
                deleted: false
            },
            raw: true
        });
        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            data: product,
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi load create category"
        });
    }
});
exports.detail = detail;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listCategories = yield category_model_1.default.findAll({
            where: {
                deleted: false
            },
            raw: true
        });
        const newListCategories = (0, create_tree_helper_1.createTreeHelper)(listCategories);
        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            categories: newListCategories,
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi load create category"
        });
    }
});
exports.create = create;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body["category_id"]) {
            req.body["category_id"] = parseInt(req.body["category_id"]);
        }
        if (req.body["price_unit"]) {
            req.body["price_unit"] = parseInt(req.body["price_unit"]);
        }
        if (req.body["quantity"]) {
            req.body["quantity"] = parseInt(req.body["quantity"]);
        }
        if (req.body["discount"]) {
            req.body["discount"] = parseInt(req.body["discount"]);
        }
        if (req.body["image_url"]) {
            req.body["image_url"] = JSON.stringify(req.body["image_url"]);
        }
        console.log(req.body);
        yield product_model_1.default.create(req.body);
        return res.json({
            code: 200,
            message: "Tạo mới sản phẩm thành công"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi tạo mới sản phẩm"
        });
    }
});
exports.createPost = createPost;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product_id = req.params["product_id"];
        const product = yield product_model_1.default.findOne({
            where: {
                deleted: false,
                product_id: parseInt(product_id)
            },
            raw: true
        });
        const listCategories = yield category_model_1.default.findAll({
            where: {
                deleted: false
            },
            raw: true
        });
        const newListCategories = (0, create_tree_helper_1.createTreeHelper)(listCategories);
        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            data: product,
            categories: newListCategories,
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi load dữ liệu sản phẩm"
        });
    }
});
exports.edit = edit;
const editPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const product_id = req.params["product_id"];
        if (req.body["category_id"]) {
            req.body["category_id"] = parseInt(req.body["category_id"]);
        }
        if (req.body["price_unit"]) {
            req.body["price_unit"] = parseInt(req.body["price_unit"]);
        }
        if (req.body["quantity"]) {
            req.body["quantity"] = parseInt(req.body["quantity"]);
        }
        if (req.body["discount"]) {
            req.body["discount"] = parseInt(req.body["discount"]);
        }
        if (req.body["description"]) {
            req.body["product_desc"] = req.body["description"];
        }
        if (req.body["image_url"]) {
            req.body["image_url"] = JSON.stringify(req.body["image_url"]);
        }
        console.log(req.body);
        yield product_model_1.default.update(Object.assign({}, req.body), {
            where: {
                product_id: parseInt(product_id)
            }
        });
        const product = yield product_model_1.default.findOne({
            where: {
                deleted: false,
                product_id: parseInt(product_id)
            },
            raw: true
        });
        return res.json({
            code: 200,
            message: "Chỉnh sửa sản phẩm thành công",
            data: product_id
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi chỉnh sửa sản phẩm"
        });
    }
});
exports.editPost = editPost;
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product_id = req.params["product_id"];
        yield product_model_1.default.update({
            deleted: true
        }, {
            where: {
                product_id: parseInt(product_id)
            }
        });
        return res.json({
            code: 200,
            message: "Xóa sản phẩm thành công!",
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi xóa sản phẩm"
        });
    }
});
exports.del = del;
