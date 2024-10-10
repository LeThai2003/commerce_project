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
exports.resetPassword = exports.passwordOtp = exports.forgotPassword = exports.logout = exports.verifyEmail = exports.register = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const credential_model_1 = __importDefault(require("../../models/credential.model"));
const send_mail_helper_1 = __importDefault(require("../../helpers/send-mail.helper"));
const verification_token_model_1 = __importDefault(require("../../models/verification-token.model"));
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../configs/database"));
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
        const accessToken = jsonwebtoken_1.default.sign({ credential_id: credential["credential_id"] }, process.env.SECRET_KEY, { expiresIn: '24h' });
        const refreshToken = jsonwebtoken_1.default.sign({ credential_id: credential["credential_id"] }, process.env.SECRET_KEY, { expiresIn: '7d' });
        const token = jsonwebtoken_1.default.sign({ credential_id: credential["credential_id"] }, process.env.SECRET_KEY, { expiresIn: '12h' });
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
            message: 'Error ( login ): ',
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
        const verificationToken = jsonwebtoken_1.default.sign({ credential_id }, process.env.SECRET_KEY, { expiresIn: "24h" });
        const verificationLink = `http://localhost:3000/user/verify-email?token=${verificationToken}`;
        const verifycation_data = {
            credential_id: user.dataValues.credential_id,
            token_type: "activation",
            verif_token: verificationToken,
            expire_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        console.log(verifycation_data);
        yield verification_token_model_1.default.create(verifycation_data);
        const content = `<p>Please click the link to verify your email: <a href="${verificationLink}">Xác nhận</a></p>`;
        (0, send_mail_helper_1.default)(user.dataValues.email, 'Verify Email', content);
        return res.json({
            code: 200,
            message: 'Registration successful! Check your email to verify your account.'
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
    try {
        const accessToken = req.headers["accesstoken"];
        yield verification_token_model_1.default.update({
            expire_date: '2023-01-01 00:00:00'
        }, {
            where: {
                verif_token: accessToken,
                token_type: "access"
            }
        });
        const refreshToken = req.headers["refreshtoken"];
        yield verification_token_model_1.default.update({
            expire_date: '2023-01-01 00:00:00'
        }, {
            where: {
                verif_token: refreshToken,
                token_type: "refresh"
            }
        });
        console.log(accessToken);
        console.log(refreshToken);
        return res.json({
            code: 200,
            message: "User logged out successfully.",
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Error - logout"
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
            FROM credentials JOIN users ON credentials.credential_id = users.credential_id
            WHERE 
                users.email = '${email}'
            `, {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true
        });
        const credential_id = credential[0]["credential_id"];
        console.log(credential_id);
        const verificationToken = jsonwebtoken_1.default.sign({ credential_id }, process.env.SECRET_KEY, { expiresIn: "24h" });
        const verificationLink = `http://localhost:3000/user/password/otp?token=${verificationToken}`;
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
        const users = yield database_1.default.query(`
            SELECT users.email 
            FROM users JOIN credentials ON users.credential_id = credentials.credential_id
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
            message: "OTP authentication successful! You can reset your password.",
            email: users[0]["email"]
        });
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.json({
                code: 400,
                message: "Token expired. Please request a resend of verification email."
            });
        }
        else {
            return res.json({
                code: 400,
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
        const user = yield user_model_1.default.findOne({
            where: {
                email: email
            },
            raw: true
        });
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
