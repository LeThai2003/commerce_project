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
exports.edit = exports.index = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const address_model_1 = __importDefault(require("../../models/address.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = res.locals.user;
        const addresses = yield address_model_1.default.findAll({
            where: {
                user_id: user["user_id"],
            },
            raw: true
        });
        user["addresses"] = addresses;
        return res.json({
            code: 200,
            data: user
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi trang tài khoản"
        });
    }
});
exports.index = index;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = res.locals.user;
        console.log();
        console.log(req.body);
        yield user_model_1.default.update({
            image_url: req.body.image_url,
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            phone: req.body.phone
        }, {
            where: {
                user_id: user["user_id"],
            }
        });
        user = yield user_model_1.default.findOne({
            where: {
                user_id: user["user_id"]
            },
            raw: true
        });
        return res.json({
            code: 200,
            data: user
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi cập nhật thông tin"
        });
    }
});
exports.edit = edit;
