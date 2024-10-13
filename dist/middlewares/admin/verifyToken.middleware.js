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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jsonwebtoken_2 = require("jsonwebtoken");
const credential_model_1 = __importDefault(require("../../models/credential.model"));
const verification_token_model_1 = __importDefault(require("../../models/verification-token.model"));
const sequelize_1 = require("sequelize");
const admin_model_1 = __importDefault(require("../../models/admin.model"));
const refreshTokenHandler = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        return {
            code: 402,
            message: "Yêu cầu refresh token"
        };
    }
    try {
        const tokenData = yield verification_token_model_1.default.findOne({
            where: {
                verif_token: token,
                token_type: "refresh_admin",
                expire_date: {
                    [sequelize_1.Op.gt]: new Date(Date.now())
                }
            },
            raw: true
        });
        if (!tokenData) {
            return {
                code: 401,
                message: "Token không hợp lệ"
            };
        }
        const newAccessToken = jsonwebtoken_1.default.sign({ credential_id: tokenData["credential_id"] }, process.env.SECRET_KEY, { expiresIn: '12h' });
        const verificationData = {
            credential_id: tokenData["credential_id"],
            token_type: "access_admin",
            verif_token: newAccessToken,
            expire_date: new Date(Date.now() + 12 * 60 * 60 * 1000)
        };
        yield verification_token_model_1.default.create(verificationData);
        return {
            code: 200,
            token: newAccessToken
        };
    }
    catch (error) {
        return {
            code: 500,
            message: "Error refreshing token."
        };
    }
});
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let accessToken = req.headers["authorization"];
    if (accessToken) {
        try {
            accessToken = accessToken.split(" ")[1];
            const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.SECRET_KEY);
            const { credential_id } = decoded;
            const credential = yield credential_model_1.default.findOne({
                where: {
                    credential_id: credential_id,
                    is_enabled: true,
                },
                raw: true,
            });
            if (!credential) {
                return res.json({
                    code: 404,
                    message: 'Tài khoản không tồn tại'
                });
            }
            const isValidToken = yield verification_token_model_1.default.findOne({
                where: {
                    token_type: "access",
                    verif_token: accessToken,
                    expire_date: {
                        [sequelize_1.Op.gt]: new Date(Date.now())
                    }
                },
                raw: true,
            });
            if (!isValidToken) {
                return res.json({
                    code: 401,
                    message: 'Token không hợp lệ. Truy cập bị từ chối'
                });
            }
            req["credential_id"] = credential_id;
            const user = yield admin_model_1.default.findOne({
                where: {
                    credential_id: credential["credential_id"]
                },
                raw: true
            });
            res.locals.user = user;
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_2.TokenExpiredError) {
                const decoded = jsonwebtoken_1.default.decode(accessToken);
                const { credential_id } = decoded;
                const record = yield verification_token_model_1.default.findOne({
                    where: {
                        credential_id: credential_id,
                        token_type: "refresh",
                    },
                    raw: true,
                });
                const refreshToken = record["verif_token"];
                if (refreshToken) {
                    const refreshResult = yield refreshTokenHandler(refreshToken);
                    if (refreshResult.code === 200) {
                        res.setHeader('Access-Control-Expose-Headers', 'accesstoken');
                        res.setHeader('accesstoken', refreshResult.token);
                        const user = yield admin_model_1.default.findOne({
                            where: {
                                credential_id: credential_id
                            },
                            raw: true
                        });
                        res.locals.user = user;
                        next();
                    }
                    else {
                        return res.json({
                            code: refreshResult.code
                        });
                    }
                }
                else {
                    return res.json({
                        code: 401,
                        message: 'Token hết hạn hoặc không có token'
                    });
                }
            }
            else {
                return res.json({
                    code: 401,
                    message: 'Token không hợp lệ. Từ chối truy cập ---'
                });
            }
        }
    }
    else {
        return res.json({
            code: 403,
            message: 'Từ chối truy cập. Không có token'
        });
    }
});
exports.default = verifyToken;
