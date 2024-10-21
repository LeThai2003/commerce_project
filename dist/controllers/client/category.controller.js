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
exports.getPrice = exports.getProductCategory = exports.index = void 0;
const category_model_1 = __importDefault(require("../../models/category.model"));
const create_tree_helper_1 = require("../../helpers/create-tree.helper");
const database_1 = __importDefault(require("../../configs/database"));
const sequelize_1 = require("sequelize");
const convert_to_slug_helper_1 = require("../../helpers/convert-to-slug.helper");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listCategories = yield category_model_1.default.findAll({
            where: {
                deleted: false
            },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deleted'] },
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
            code: 500,
            message: "Lỗi load create category"
        });
    }
});
exports.index = index;
const getProductCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category_id = req.params["category_id"];
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;
        let sortKey = 'product_title';
        let sortValue = 'ASC';
        if (req.query.sortKey && req.query.sortValue) {
            sortKey = req.query.sortKey.toUpperCase();
            sortValue = req.query.sortValue.toUpperCase();
        }
        let searchKey = req.query.searchKey || "";
        searchKey = (0, convert_to_slug_helper_1.convertToSlug)(searchKey.toLowerCase());
        const products = yield database_1.default.query(`
                WITH RECURSIVE category_hierarchy AS (
                    SELECT category_id, parent_category_id, category_title
                    FROM categories
                    WHERE category_id = ${parseInt(category_id)} 

                    UNION ALL

                    SELECT c.category_id, c.parent_category_id, c.category_title
                    FROM categories c
                    INNER JOIN category_hierarchy ch ON c.parent_category_id = ch.category_id
                )
                SELECT p.product_id, p.product_title, p.product_desc, p.image_url, p.price_unit, p.quantity, p.discount, p.slug
                FROM products p
                WHERE p.category_id IN (SELECT category_id FROM category_hierarchy)
                AND p.slug LIKE '%${searchKey}%'
                ORDER BY ${sortKey} ${sortValue}
                LIMIT ${limit} OFFSET ${offset};
            `, {
            raw: true,
            type: sequelize_1.QueryTypes.SELECT
        });
        const totalPage = Math.ceil(products.length / limit);
        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            data: products,
            page: page,
            totalPage: totalPage
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi load product of category " + error
        });
    }
});
exports.getProductCategory = getProductCategory;
const getPrice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const objectPrice = yield database_1.default.query(`
            SELECT MIN(products.price_unit * (1 - (products.discount or 0)/100)) as min, MAX(products.price_unit * (1 - (products.discount or 0)/100)) as max
            FROM products
        `, {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true
        });
        console.log(objectPrice);
        const fromPrice = objectPrice[0]["min"];
        const toPrice = objectPrice[0]["max"];
        return res.json({
            code: 200,
            fromPrice: parseInt(fromPrice),
            toPrice: parseInt(toPrice) + 1
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi " + error
        });
    }
});
exports.getPrice = getPrice;
