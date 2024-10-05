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
exports.del = exports.editPatch = exports.edit = exports.createPost = exports.create = void 0;
const category_model_1 = __importDefault(require("../../models/category.model"));
const create_tree_helper_1 = require("../../helpers/create-tree.helper");
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listCategories = yield category_model_1.default.findAll({
            where: {
                deleted: false
            },
            raw: true
        });
        const newListCategories = (0, create_tree_helper_1.createTreeHelper)(listCategories);
        console.log(newListCategories);
        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            data: newListCategories,
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
        console.log(req.body);
        yield category_model_1.default.create({
            parent_category_id: parseInt(req.body["parent_category_id"]),
            category_title: req.body["category_title"],
            image_url: req.body["image_url"]
        });
        return res.json({
            code: 200,
            message: "Thêm danh mục thành công"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi create category"
        });
    }
});
exports.createPost = createPost;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id } = req.params;
        console.log(category_id);
        const category = yield category_model_1.default.findOne({
            where: {
                category_id: parseInt(category_id),
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
            message: "Lấy danh mục thành công",
            data: category,
            listCategories: newListCategories
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy dữ liệu danh mục"
        });
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id } = req.params;
        console.log(req.body);
        if (req.body["parent_category_id"]) {
            req.body["parent_category_id"] = parseInt(req.body["parent_category_id"]);
        }
        yield category_model_1.default.update(Object.assign({}, req.body), {
            where: {
                category_id: parseInt(category_id)
            }
        });
        return res.json({
            code: 200,
            message: "Chỉnh sửa danh mục thành công"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi chỉnh sửa danh mục"
        });
    }
});
exports.editPatch = editPatch;
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id } = req.params;
        yield category_model_1.default.update({
            deleted: 1
        }, {
            where: {
                category_id: parseInt(category_id)
            }
        });
        return res.json({
            code: 200,
            message: "Xóa danh mục thành công"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi xóa danh mục"
        });
    }
});
exports.del = del;
