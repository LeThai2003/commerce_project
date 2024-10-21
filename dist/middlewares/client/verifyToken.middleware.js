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
const user_model_1 = __importDefault(require("../../models/user.model"));
const console_1 = require("console");
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let accessToken = req.headers["authorization"];
    console.log("Logout: ==============1==========" + accessToken);
    if (accessToken) {
        try {
            accessToken = accessToken.split(" ")[1];
            const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.SECRET_KEY);
            const { credential_id } = decoded;
            console.log("Logout: =============2===========" + accessToken);
            console.log("Logout: =============3===========" + credential_id);
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
                },
                raw: true,
            });
            if (!isValidToken) {
                return res.json({
                    code: 401,
                    message: 'Token không hợp lệ. Truy cập bị từ chối-TẠi sao--'
                });
            }
            req["credential_id"] = credential_id;
            const user = yield user_model_1.default.findOne({
                where: {
                    credential_id: credential["credential_id"]
                },
                raw: true
            });
            res.locals.user = user;
            console.log("-----------5---------------");
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_2.TokenExpiredError) {
                return res.json({
                    code: 400,
                    message: "access-token-expired"
                });
            }
        }
    }
    else {
        return res.json({
            code: 403,
            message: 'Từ chối truy cập. Không có token----' + console_1.error
        });
    }
});
exports.default = verifyToken;
