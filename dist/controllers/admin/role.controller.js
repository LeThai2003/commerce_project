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
exports.editPermission = exports.editPatch = exports.edit = exports.create = exports.index = void 0;
const roles_model_1 = __importDefault(require("../../models/roles.model"));
const sequelize_1 = require("sequelize");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield roles_model_1.default.create(req.body);
        return res.json({
            code: 200,
            message: "Tạo role thành công"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi tạo role " + error
        });
    }
});
exports.create = create;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role_id = req.params["role_id"];
        const role = yield roles_model_1.default.findOne({
            where: {
                role_id: parseInt(role_id)
            },
            raw: true
        });
        return res.json({
            code: 200,
            data: role
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy dữ liệu role " + error
        });
    }
});
exports.edit = edit;
const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role_id = req.params["role_id"];
        yield roles_model_1.default.update(Object.assign({}, req.body), {
            where: {
                role_id: parseInt(role_id),
            }
        });
        return res.json({
            code: 200,
            message: "Cập nhật thành công"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi cập nhật role " + error
        });
    }
});
exports.editPatch = editPatch;
const editPermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        for (const item of req.body) {
            yield roles_model_1.default.update({
                permissions: item["permissions"]
            }, {
                where: {
                    role_id: item["role_id"]
                }
            });
        }
        return res.json({
            code: 200,
            message: "Phân quyền thành công"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi phân quyền " + error
        });
    }
});
exports.editPermission = editPermission;
