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
exports.deleteAccount = exports.resetDefaultPassword = exports.resetPassword = exports.passwordOtp = exports.forgotPassword = exports.logout = exports.login = exports.createPost = exports.getCreate = exports.editAccountPost = exports.detail = exports.index = void 0;
const roles_model_1 = __importDefault(require("../../models/roles.model"));
const admin_model_1 = __importDefault(require("../../models/admin.model"));
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const credential_model_1 = __importDefault(require("../../models/credential.model"));
const verification_token_model_1 = __importDefault(require("../../models/verification-token.model"));
const database_1 = __importDefault(require("../../configs/database"));
const send_mail_helper_1 = __importDefault(require("../../helpers/send-mail.helper"));
const systemConfig_1 = __importDefault(require("../../configs/systemConfig"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = {
            deleted: false
        };
        if (req.query["first_name"]) {
            find["first_name"] = sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn('LOWER', sequelize_1.Sequelize.col('first_name')), {
                [sequelize_1.Op.like]: '%' + req.query["first_name"].toLowerCase() + '%'
            });
        }
        if (req.query["last_name"]) {
            find["last_name"] = sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn('LOWER', sequelize_1.Sequelize.col('last_name')), {
                [sequelize_1.Op.like]: '%' + req.query["last_name"].toLowerCase() + '%'
            });
        }
        if (req.query["email"]) {
            find["email"] = {
                [sequelize_1.Op.like]: '%' + req.query["email"] + '%'
            };
        }
        if (req.query["phone"]) {
            find["phone"] = {
                [sequelize_1.Op.like]: '%' + req.query["phone"] + '%'
            };
        }
        const accounts = yield admin_model_1.default.findAll({
            where: find,
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            raw: true
        });
        for (const account of accounts) {
            const infoCredential = yield credential_model_1.default.findOne({
                where: {
                    credential_id: account["credential_id"],
                },
                raw: true
            });
            account["username"] = infoCredential["username"];
        }
        return res.json({
            code: 200,
            message: "Lấy danh sách roles",
            data: accounts
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi lấy danh sách roles" + error
        });
    }
});
exports.index = index;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = res.locals.admin;
        console.log(admin);
        const data = admin;
        const credential = yield credential_model_1.default.findOne({
            where: {
                credential_id: admin["credential_id"]
            },
            attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
            raw: true
        });
        console.log(credential);
        const role = yield roles_model_1.default.findOne({
            where: {
                role_id: credential["role_id"],
            },
            raw: true
        });
        data["username"] = credential["username"];
        data["role"] = role["title"];
        data["user_id"] = admin["admin_id"];
        return res.json({
            code: 200,
            message: "Lấy tài khoản thành công",
            data: data
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi lấy tài khoản " + error
        });
    }
});
exports.detail = detail;
const editAccountPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = res.locals.admin;
        yield admin_model_1.default.update(Object.assign({}, req.body), {
            where: {
                admin_id: admin["admin_id"]
            }
        });
        return res.json({
            code: 200,
            message: "Cập nhật tài khoản thành công"
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi cập nhật tài khoản " + error
        });
    }
});
exports.editAccountPost = editAccountPost;
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
            code: 500,
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
                code: "409",
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
        return res.json({
            code: 200,
            message: "Tạo tài khoản thành công, bạn có thể đăng nhập"
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi tạo tài khoản" + error
        });
    }
});
exports.createPost = createPost;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { username, password } = req.body;
    try {
        const credential = yield credential_model_1.default.findOne({
            where: {
                username: username,
                role_id: {
                    [sequelize_1.Op.ne]: 12
                }
            },
            raw: true
        });
        if (!credential || credential["is_enabled"][0] !== 1) {
            return res.json({
                code: 403,
                message: 'Tài khoản bị vô hiệu hóa'
            });
        }
        const isValidPassword = yield bcrypt_1.default.compare(password, credential["password"]);
        if (!isValidPassword) {
            return res.json({
                code: 401,
                message: 'Mật khẩu không đúng'
            });
        }
        console.log(credential);
        const role = yield roles_model_1.default.findOne({
            where: {
                role_id: credential['role_id']
            },
            raw: true
        });
        const accessToken = jsonwebtoken_1.default.sign({ credential_id: credential["credential_id"], role: role['title'] }, process.env.SECRET_KEY, { expiresIn: '24h' });
        const refreshToken = jsonwebtoken_1.default.sign({ credential_id: credential["credential_id"], role: role['title'] }, process.env.SECRET_KEY, { expiresIn: '7d' });
        const verifycation_data = {
            credential_id: credential["credential_id"],
            token_type: "access",
            verif_token: accessToken,
            expire_date: new Date(Date.now() + 12 * 60 * 60 * 1000)
        };
        const refreshTokenData = {
            credential_id: credential["credential_id"],
            token_type: "refresh",
            verif_token: refreshToken,
            expire_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        yield verification_token_model_1.default.destroy({
            where: {
                credential_id: credential["credential_id"],
                token_type: {
                    [sequelize_1.Op.or]: ["refresh", "access"]
                }
            }
        });
        yield verification_token_model_1.default.create(verifycation_data);
        yield verification_token_model_1.default.create(refreshTokenData);
        return res.json({
            code: 200,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    }
    catch (error) {
        return res.json({
            code: "400",
            message: 'Error ( login ): ' + error,
        });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.headers["authorization"].split(" ")[1];
        const credential_id = jsonwebtoken_1.default.verify(accessToken, process.env.SECRET_KEY);
        yield verification_token_model_1.default.destroy({
            where: {
                credential_id: credential_id,
                token_type: {
                    [sequelize_1.Op.or]: ["access", "refresh"]
                }
            }
        });
        return res.json({
            code: 200,
            message: "User logged out successfully.",
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi đăng xuất tài khoản" + error
        });
    }
});
exports.logout = logout;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        console.log(email);
        const credential = yield database_1.default.query(`
            SELECT credentials.credential_id 
            FROM credentials JOIN admins ON credentials.credential_id = admins.credential_id
            WHERE 
                admins.email = '${email}'
            `, {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true
        });
        const credential_id = credential[0]["credential_id"];
        console.log(credential_id);
        const verificationToken = jsonwebtoken_1.default.sign({ credential_id }, process.env.SECRET_KEY, { expiresIn: "24h" });
        const verificationLink = `http://localhost:3000${systemConfig_1.default["base_path"]}/password/otp?token=${verificationToken}`;
        const verifycation_data = {
            credential_id: credential_id,
            token_type: "forgot_password",
            verif_token: verificationToken,
            expire_date: new Date(Date.now() + 5 * 60 * 1000)
        };
        yield verification_token_model_1.default.create(verifycation_data);
        const content = `<p>Please click <a href="${verificationLink}">confirm</a> to reset your password. If it's not you, click report!</p>`;
        (0, send_mail_helper_1.default)(email, 'Confirm forgot password', content);
        return res.json({
            code: 200,
            message: 'Email sent successfully! Check your email.'
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: 'Failed forgot password.'
        });
    }
});
exports.forgotPassword = forgotPassword;
const passwordOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.query.token;
        const isActiveToken = yield verification_token_model_1.default.findOne({
            where: {
                verif_token: token,
                token_type: "forgot_password",
                expire_date: {
                    [sequelize_1.Op.gt]: new Date(Date.now()),
                }
            },
            raw: true
        });
        if (!isActiveToken) {
            return res.json({
                code: 401,
                message: "Invalid token"
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        const { credential_id } = decoded;
        const admin = yield database_1.default.query(`
            SELECT admins.email 
            FROM admins JOIN credentials ON admins.credential_id = credentials.credential_id
            WHERE
                credentials.credential_id = ${credential_id}
            `, {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true
        });
        yield verification_token_model_1.default.update({
            expire_date: '2023-01-01 00:00:00'
        }, {
            where: {
                verification_token_id: isActiveToken["verification_token_id"]
            }
        });
        return res.json({
            code: 200,
            message: "OTP authentication successful! You can reset your password",
            email: admin[0]["email"]
        });
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.json({
                code: 400,
                message: "Token expired. Please request a resend of verification email"
            });
        }
        else {
            return res.json({
                code: 401,
                message: "Invalid or expired token",
            });
        }
    }
});
exports.passwordOtp = passwordOtp;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, comfirmPassword } = req.body;
        if (password !== comfirmPassword) {
            return res.json({
                code: 401,
                message: "Password and confirm password are not the same."
            });
        }
        const hashPassword = yield bcrypt_1.default.hash(password, 10);
        const admin = yield admin_model_1.default.findOne({
            where: {
                email: email
            },
            raw: true
        });
        yield credential_model_1.default.update({
            password: hashPassword,
        }, {
            where: {
                credential_id: admin["credential_id"]
            }
        });
        return res.json({
            code: 200,
            message: "Reset password successfully! You can login now."
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Error in reset password."
        });
    }
});
exports.resetPassword = resetPassword;
const resetDefaultPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.params["admin_id"];
        const defaultPassword = yield bcrypt_1.default.hash("123", 10);
        const admin = yield admin_model_1.default.findOne({
            where: {
                admin_id: adminId
            },
            raw: true
        });
        yield credential_model_1.default.update({
            password: defaultPassword
        }, {
            where: {
                credential_id: admin["credential_id"]
            }
        });
        return res.json({
            code: 200,
            message: "Reset default password successfully"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Error Reset default password " + error
        });
    }
});
exports.resetDefaultPassword = resetDefaultPassword;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.params["admin_id"];
        const admin = yield admin_model_1.default.findOne({
            where: {
                admin_id: adminId
            },
            raw: true
        });
        yield credential_model_1.default.update({
            deleted: 1
        }, {
            where: {
                credential_id: admin["credential_id"]
            }
        });
        yield admin_model_1.default.update({
            deleted: 1
        }, {
            where: {
                admin_id: adminId
            }
        });
        return res.json({
            code: 200,
            message: "Deleted account successfully"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Error Deleted account " + error
        });
    }
});
exports.deleteAccount = deleteAccount;
