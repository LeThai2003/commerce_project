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
exports.refreshToken = exports.resetPassword = exports.passwordOtp = exports.forgotPassword = exports.logout = exports.verifyEmail = exports.register = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jsonwebtoken_2 = require("jsonwebtoken");
const user_model_1 = __importDefault(require("../../models/user.model"));
const credential_model_1 = __importDefault(require("../../models/credential.model"));
const send_mail_helper_1 = __importDefault(require("../../helpers/send-mail.helper"));
const verification_token_model_1 = __importDefault(require("../../models/verification-token.model"));
const sequelize_1 = require("sequelize");
const generate_helper_1 = require("../../helpers/generate.helper");
const forgotPassword_model_1 = __importDefault(require("../../models/forgotPassword.model"));
const roles_model_1 = __importDefault(require("../../models/roles.model"));
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { username, password } = req.body;
    try {
        const credential = yield credential_model_1.default.findOne({
            where: {
                username: username
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
        const role = yield roles_model_1.default.findOne({
            where: {
                role_id: credential['role_id']
            },
            raw: true
        });
        const accessToken = jsonwebtoken_1.default.sign({ credential_id: credential["credential_id"], role: role['title'] }, process.env.SECRET_KEY, { expiresIn: '12h' });
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
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { username, password, first_name, last_name, email, phone, image_url } = req.body;
        const userExist = yield user_model_1.default.findOne({
            where: {
                email: email
            },
            raw: true,
        });
        if (userExist) {
            return res.json({
                code: "409",
                message: 'Email đã được đăng ký'
            });
        }
        const hashPassword = yield bcrypt_1.default.hash(password, 10);
        const data_credential = {
            username: username,
            password: hashPassword,
            role_id: 12
        };
        const credential = yield credential_model_1.default.create(data_credential);
        const credential_id = credential.dataValues.credential_id;
        const data_user = {
            credential_id: credential_id,
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone: phone,
            image_url: image_url || ""
        };
        const user = yield user_model_1.default.create(data_user);
        return res.json({
            code: 200,
            message: 'Registration successful! You can log in now'
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: 'Failed - register'
        });
    }
});
exports.register = register;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.query.token;
        const isActiveToken = yield verification_token_model_1.default.findOne({
            where: {
                verif_token: token,
                token_type: "activation",
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
        yield credential_model_1.default.update({
            is_enabled: 1
        }, {
            where: {
                credential_id: credential_id,
            }
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
            message: "Email verified! You can now log in.",
        });
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.json({
                code: 401,
                message: "REQUEST A RESEND EMAIL"
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
exports.verifyEmail = verifyEmail;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let accessToken = req.headers["authorization"];
    if (accessToken) {
        try {
            accessToken = accessToken.split(" ")[1];
            const decoded = jsonwebtoken_1.default.decode(accessToken, process.env.SECRET_KEY);
            const { credential_id } = decoded;
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
                message: "Đăng xuất tài khoản thành công",
            });
        }
        catch (error) {
            if (error instanceof jsonwebtoken_2.TokenExpiredError) {
                const decoded = jsonwebtoken_1.default.decode(accessToken);
                const { credential_id } = decoded;
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
                    message: "Đăng xuất tài khoản thành công",
                });
            }
            return res.json({
                code: 400,
                message: "Error - logout"
            });
        }
    }
    else {
        return res.json({
            code: 400,
            message: "không có accesstoken được truyền lên"
        });
    }
});
exports.logout = logout;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        console.log(email);
        const emailExist = yield user_model_1.default.findOne({
            where: {
                email: email
            },
            raw: true
        });
        if (!emailExist) {
            return res.json({
                code: 400,
                message: "Email không tồn tại"
            });
        }
        const otp = (0, generate_helper_1.generateRandomNumber)(4);
        yield forgotPassword_model_1.default.create({
            email: email,
            otp: otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });
        console.log("-----");
        const content = `Mã OTP của bạn là <b>${otp}</b>. <i>Mã có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã cho bất kỳ ai!</i>`;
        (0, send_mail_helper_1.default)(email, 'OTP FORGOT PASSWORD', content);
        return res.json({
            code: 200,
            message: 'Email sent successfully! Check your email',
            email: email
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: 'Failed forgot password. ' + error
        });
    }
});
exports.forgotPassword = forgotPassword;
const passwordOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const otp = req.body.otp;
        const forgotPassword = yield forgotPassword_model_1.default.findOne({
            where: {
                email: email,
                otp: otp,
                expiresAt: {
                    [sequelize_1.Op.gte]: new Date(Date.now()),
                },
                verify_otp: false
            },
            raw: true
        });
        if (!forgotPassword) {
            res.json({
                code: 400,
                message: "OTP không hợp lệ"
            });
            return;
        }
        else {
            yield forgotPassword_model_1.default.update({
                verify_otp: true
            }, {
                where: {
                    forgot_password_id: forgotPassword["forgot_password_id"]
                }
            });
        }
        return res.json({
            code: 200,
            message: "OTP authentication successful! You can reset your password"
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi " + error
        });
    }
});
exports.passwordOtp = passwordOtp;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, comfirmPassword } = req.body;
        const user = yield user_model_1.default.findOne({
            where: {
                email: email
            },
            raw: true
        });
        if (!user) {
            return res.json({
                code: 404,
                message: "Người dùng không tồn tại"
            });
        }
        if (password !== comfirmPassword) {
            return res.json({
                code: 401,
                message: "Password and confirm password are not the same"
            });
        }
        const hashPassword = yield bcrypt_1.default.hash(password, 10);
        yield credential_model_1.default.update({
            password: hashPassword,
        }, {
            where: {
                credential_id: user["credential_id"]
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
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.json({
            code: 401,
            message: "Refresh token is required"
        });
    }
    try {
        const tokenData = yield verification_token_model_1.default.findOne({
            where: {
                verif_token: refreshToken,
                token_type: "refresh",
                expire_date: {
                    [sequelize_1.Op.gte]: new Date(Date.now())
                }
            },
            raw: true
        });
        if (!tokenData) {
            return res.json({
                code: 401,
                message: "Invalid refresh token"
            });
        }
        const credential = yield credential_model_1.default.findOne({
            where: {
                credential_id: tokenData["credential_id"]
            },
            raw: true
        });
        const role = yield roles_model_1.default.findOne({
            where: {
                role_id: credential['role_id']
            },
            raw: true
        });
        const newAccessToken = jsonwebtoken_1.default.sign({ credential_id: tokenData["credential_id"], role: role['title'] }, process.env.SECRET_KEY, { expiresIn: '12h' });
        yield verification_token_model_1.default.destroy({
            where: {
                token_type: "access",
                credential_id: tokenData["credential_id"],
            }
        });
        const verifycation_data = {
            credential_id: tokenData["credential_id"],
            token_type: "access",
            verif_token: newAccessToken,
            expire_date: new Date(Date.now() + 12 * 60 * 60 * 1000)
        };
        yield verification_token_model_1.default.create(verifycation_data);
        return res.json({
            code: 200,
            token: newAccessToken
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Error refreshing token."
        });
    }
});
exports.refreshToken = refreshToken;
