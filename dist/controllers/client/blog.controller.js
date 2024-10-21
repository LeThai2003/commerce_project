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
exports.listBlog = exports.postComment = void 0;
const comment_model_1 = __importDefault(require("../../models/comment.model"));
const blog_model_1 = __importDefault(require("../../models/blog.model"));
const pagination_helper_1 = require("../../helpers/pagination.helper");
const postComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const user = res.locals.user;
        console.log(req.body);
        yield comment_model_1.default.create({
            product_id: productId,
            user_id: user["user_id"],
            content: req.body.content,
            star: parseFloat(req.body.rate),
            image_url: JSON.stringify(req.body.image_url)
        });
        return res.json({
            code: 200,
            message: "Comment successfully!",
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi post comment " + error
        });
    }
});
exports.postComment = postComment;
const listBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            code: 500,
            message: "Lỗi lấy danh sách blogs " + error
        });
    }
});
exports.listBlog = listBlog;
