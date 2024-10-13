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
exports.setDefaultAddess = exports.addAddress = exports.index = void 0;
const address_model_1 = __importDefault(require("../../models/address.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = res.locals.user;
        const addresses = yield address_model_1.default.findAll({
            where: {
                user_id: user["user_id"],
            },
            raw: true
        });
        return res.json({
            code: 200,
            data: addresses
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi lấy địa chỉ " + error
        });
    }
});
exports.index = index;
const addAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = res.locals.user;
        const address_name = req.body["address_name"];
        if (!address_name.trim()) {
            return ({
                code: 400,
                message: "Không được để trống địa chỉ"
            });
        }
        const isUserExist = yield address_model_1.default.findOne({
            where: {
                user_id: user["user_id"]
            },
            raw: true
        });
        if (isUserExist) {
            yield address_model_1.default.create({
                address_name: address_name,
                user_id: user["user_id"],
                default_address: false,
            });
        }
        else {
            yield address_model_1.default.create({
                address_name: address_name,
                user_id: user["user_id"],
                default_address: true,
            });
        }
        const addresses = yield address_model_1.default.findAll({
            where: {
                user_id: user["user_id"],
            },
            raw: true
        });
        return res.json({
            code: 200,
            message: "Thêm thành công",
            data: addresses
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi đánh giá sao " + error
        });
    }
});
exports.addAddress = addAddress;
const setDefaultAddess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = res.locals.user;
        const address_id = parseInt(req.params["address_id"]);
        const addressExist = yield address_model_1.default.findOne({
            where: {
                address_id: address_id
            },
            raw: true
        });
        if (!addressExist) {
            return res.json({
                code: 404,
                message: "Không tồn tại id"
            });
        }
        yield address_model_1.default.update({
            default_address: 0
        }, {
            where: {
                user_id: user["user_id"]
            }
        });
        yield address_model_1.default.update({
            default_address: 1
        }, {
            where: {
                address_id: address_id
            }
        });
        const addresses = yield address_model_1.default.findAll({
            where: {
                user_id: user["user_id"],
            },
            raw: true
        });
        return res.json({
            code: 200,
            message: "Cập nhật địa chỉ mặc định thành công",
            data: addresses
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi đánh giá sao " + error
        });
    }
});
exports.setDefaultAddess = setDefaultAddess;
