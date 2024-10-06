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
exports.del = exports.editPost = exports.edit = exports.createPost = exports.create = void 0;
const category_model_1 = __importDefault(require("../../models/category.model"));
const create_tree_helper_1 = require("../../helpers/create-tree.helper");
const product_model_1 = __importDefault(require("../../models/product.model"));
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
