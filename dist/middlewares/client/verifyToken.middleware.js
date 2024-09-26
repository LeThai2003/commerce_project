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
const credential_model_1 = __importDefault(require("../../models/credential.model"));
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers['authorization']) {
        const token = req.headers['authorization'].split(" ")[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
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
                    code: 400,
                    message: 'Account not activated or does not exist.'
                });
            }
            req["credential_id"] = credential_id;
            next();
        }
        catch (error) {
            return res.json({
                code: 401,
                message: 'Invalid token. Access denied.'
            });
        }
    }
    else {
        return res.json({
            code: 403,
            message: 'Access denied. No token provided.'
        });
    }
});
exports.default = verifyToken;