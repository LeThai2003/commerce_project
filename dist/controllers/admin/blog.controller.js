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
exports.createPost = exports.productsOfCategory = exports.index = void 0;
const category_model_1 = __importDefault(require("../../models/category.model"));
const pagination_helper_1 = require("../../helpers/pagination.helper");
const database_1 = __importDefault(require("../../configs/database"));
const sequelize_1 = require("sequelize");
const blog_model_1 = __importDefault(require("../../models/blog.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listCategories = yield category_model_1.default.findAll({
            where: {
                deleted: false
            },
            raw: true
        });
        const objectPagination = (0, pagination_helper_1.paginationHelper)(req, listCategories.length);
        const paginatedCategories = listCategories.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);
        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            data: paginatedCategories,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"]
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi load category " + error
        });
    }
});
exports.index = index;
const productsOfCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category_id = req.params.category_id;
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
        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            data: ids,
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi load category " + error
        });
    }
});
exports.productsOfCategory = productsOfCategory;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        yield blog_model_1.default.create({
            title: req.body["title"],
            content: req.body["content"],
            image_url: JSON.stringify(req.body["image_url"])
        });
        return res.json({
            code: 200,
            message: "post a blog successfully"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi post blog"
        });
    }
});
exports.createPost = createPost;
