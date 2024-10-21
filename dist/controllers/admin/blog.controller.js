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
exports.deleteBlog = exports.editPatch = exports.createPost = exports.detail = exports.index = void 0;
const pagination_helper_1 = require("../../helpers/pagination.helper");
const blog_model_1 = __importDefault(require("../../models/blog.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogsList = yield blog_model_1.default.findAll({
            where: {
                deleted: false
            },
            attributes: { exclude: ['deleted', 'updatedAt'] },
            raw: true
        });
        console.log(blogsList);
        const objectPagination = (0, pagination_helper_1.paginationHelper)(req, blogsList.length);
        const paginatedBlogs = blogsList.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);
        return res.json({
            code: 200,
            message: "Lấy danh sách blogs thành công",
            data: paginatedBlogs,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"]
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy danh sách blogs " + error
        });
    }
});
exports.index = index;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogId = req.params["blog_id"];
        const blog = yield blog_model_1.default.findOne({
            where: {
                deleted: false,
                blog_id: blogId
            },
            attributes: { exclude: ['deleted', 'updatedAt'] },
            raw: true
        });
        console.log(blog);
        return res.json({
            code: 200,
            message: "Lấy danh sách blogs thành công",
            data: blog
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy danh sách blogs " + error
        });
    }
});
exports.detail = detail;
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
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogId = req.params["blog_id"];
        console.log(req.body);
        if (req.body["image_url"]) {
            req.body["image_url"] = JSON.stringify(req.body["image_url"]);
        }
        yield blog_model_1.default.update(Object.assign({}, req.body), {
            where: {
                blog_id: blogId
            }
        });
        return res.json({
            code: 200,
            message: "Edit a blog successfully"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi edit blog"
        });
    }
});
exports.editPatch = editPatch;
const deleteBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogId = req.params["blog_id"];
        yield blog_model_1.default.update({
            deleted: 1
        }, {
            where: {
                blog_id: blogId
            }
        });
        return res.json({
            code: 200,
            message: "Delete a blog successfully"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi delete blog"
        });
    }
});
exports.deleteBlog = deleteBlog;
