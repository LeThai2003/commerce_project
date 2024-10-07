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
const category_model_1 = __importDefault(require("../../models/category.model"));
const create_tree_helper_1 = require("../../helpers/create-tree.helper");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listCategories = yield category_model_1.default.findAll({
            where: {
                deleted: false
            },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deleted'] },
            raw: true
        });
        const newListCategories = (0, create_tree_helper_1.createTreeHelper)(listCategories);
        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            categories: newListCategories,
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi load create category"
        });
    }
});
exports.index = index;
