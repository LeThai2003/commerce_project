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
exports.login = exports.createPost = exports.getCreate = exports.index = void 0;
const roles_model_1 = __importDefault(require("../../models/roles.model"));
const admin_model_1 = __importDefault(require("../../models/admin.model"));
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const credential_model_1 = __importDefault(require("../../models/credential.model"));
const verification_token_model_1 = __importDefault(require("../../models/verification-token.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accounts = yield admin_model_1.default.findAll({
            where: {
                deleted: false,
            },
            raw: true
        });
        return res.json({
            code: 200,
            message: "Lấy danh sách roles",
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy danh sách roles" + error
        });
    }
});
exports.index = index;
const getCreate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield roles_model_1.default.findAll({
            where: {
                deleted: false,
                role_id: {
                    [sequelize_1.Op.ne]: 12
                }
            },
            raw: true
        });
        return res.json({
            code: 200,
            message: "Dữ liệu các nhóm quyền",
            data: roles
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy danh sách roles" + error
        });
    }
});
exports.getCreate = getCreate;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { email, password, role_id, first_name, last_name, phone, image_url } = req.body;
        const userExist = yield admin_model_1.default.findOne({
            where: {
                email: email
            },
            raw: true,
        });
        if (userExist) {
            return res.json({
                code: "400",
                message: 'email trùng'
            });
        }
        const hashPassword = yield bcrypt_1.default.hash(password, 10);
        const data_credential = {
            username: email,
            password: hashPassword,
            role_id: parseInt(role_id),
            is_enabled: true
        };
        const credential = yield credential_model_1.default.create(data_credential);
        const credential_id = credential.dataValues.credential_id;
        const data_admin = {
            credential_id: credential_id,
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone: phone || "",
            image_url: image_url || ""
        };
        const admin = yield admin_model_1.default.create(data_admin);
        const accessToken = jsonwebtoken_1.default.sign({ credential_id: credential["credential_id"] }, process.env.SECRET_KEY, { expiresIn: '24h' });
        const refreshToken = jsonwebtoken_1.default.sign({ credential_id: credential["credential_id"] }, process.env.SECRET_KEY, { expiresIn: '7d' });
        const verifycation_data = {
            credential_id: credential_id,
            token_type: "access",
            verif_token: accessToken,
            expire_date: new Date(Date.now() + 12 * 60 * 60 * 1000)
        };
        const refreshTokenData = {
            credential_id: credential_id,
            token_type: "refresh",
            verif_token: refreshToken,
            expire_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        yield verification_token_model_1.default.create(verifycation_data);
        yield verification_token_model_1.default.create(refreshTokenData);
        return res.json({
            code: 200,
            message: "Tạo tài khoản thành công, bạn có thể đăng nhập"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi tạo tài khoản" + error
        });
    }
});
exports.createPost = createPost;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        return res.json({
            code: 200,
            message: "Đăng nhập thành công",
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi đăng nhập" + error
        });
    }
});
exports.login = login;
