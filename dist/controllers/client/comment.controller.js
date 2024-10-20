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
exports.listComment = exports.postComment = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const rate_model_1 = __importDefault(require("../../models/rate.model"));
const comment_model_1 = __importDefault(require("../../models/comment.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const postComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const user = res.locals.user;
        console.log(req.body);
        yield comment_model_1.default.create({
            product_id: parseInt(productId),
            user_id: user["user_id"],
            content: req.body.content,
            star: parseFloat(req.body.rate),
            image_url: req.body.image_url
        });
        yield rate_model_1.default.create({
            star: parseFloat(req.body.rate),
            product_id: parseInt(productId),
            user_id: user["user_id"],
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
const listComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.productId;
        const user = res.locals.user;
        let isCommented = false;
        const listComment = yield comment_model_1.default.findAll({
            where: {
                product_id: parseInt(productId),
                deleted: false
            },
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
        let accessToken = req.headers.authorization;
        if (accessToken && accessToken.trim() != "Bearer") {
            const decoded = jsonwebtoken_1.default.decode(accessToken.split(" ")[1]);
            const { credential_id } = decoded;
            const user = yield user_model_1.default.findOne({
                where: {
                    credential_id: credential_id,
                },
                raw: true
            });
            if (user) {
                const existUserComment = listComment.find(item => item["user_id"] === user["user_id"]);
                if (existUserComment) {
                    isCommented = true;
                }
            }
        }
        return res.json({
            code: 200,
            message: "Lấy danh sách comment thành công",
            data: listComment,
            commented: isCommented
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi lấy danh sách comment " + error
        });
    }
});
exports.listComment = listComment;
