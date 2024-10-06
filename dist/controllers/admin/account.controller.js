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
exports.index = void 0;
const roles_model_1 = __importDefault(require("../../models/roles.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield roles_model_1.default.findAll({
            where: {
                deleted: false,
            },
            raw: true
        });
        return res.json({
            code: 200,
            message: "Lấy danh sách roles",
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
exports.index = index;
