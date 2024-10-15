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
exports.topRate = exports.index = void 0;
const product_model_1 = __importDefault(require("../../models/product.model"));
const sequelize_1 = require("sequelize");
const rate_model_1 = __importDefault(require("../../models/rate.model"));
const database_1 = __importDefault(require("../../configs/database"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, rate } = req.params;
        const user = res.locals.user;
        const rateExist = yield rate_model_1.default.findOne({
            where: {
                product_id: parseInt(productId),
                user_id: user["user_id"]
            },
            raw: true
        });
        if (!rateExist) {
            yield rate_model_1.default.create({
                star: parseFloat(rate),
                product_id: parseInt(productId),
                user_id: user["user_id"],
            });
        }
        else {
            yield rate_model_1.default.update({
                star: parseFloat(rate),
            }, {
                where: {
                    id_rate: rateExist["id_rate"]
                }
            });
        }
        return res.json({
            code: 200,
            message: "Đánh giá sao thành công!",
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi đánh giá sao " + error
        });
    }
});
exports.index = index;
const topRate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dataTopRating = yield database_1.default.query(`
            SELECT product_id, AVG(star) as rating
            FROM rate
            GROUP BY product_id
            ORDER BY rating DESC
            LIMIT 6    
        `, {
            raw: true,
            type: sequelize_1.QueryTypes.SELECT,
        });
        console.log(dataTopRating);
        let ids = [];
        for (const item of dataTopRating) {
            item["rating"] = parseFloat(item["rating"]);
            ids.push(item["product_id"]);
        }
        const products = yield product_model_1.default.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt', 'deleted'] },
            where: {
                product_id: {
                    [sequelize_1.Op.in]: ids
                }
            },
            raw: true
        });
        console.log(products);
        let newProducts = [];
        for (const item of dataTopRating) {
            newProducts.push(Object.assign(Object.assign({}, item), products.find(item => item["product_id"] === item["product_id"])));
        }
        return res.json({
            code: 200,
            message: "Lấy danh sách top rate thành công",
            data: newProducts
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi lấy danh sách top-rate " + error
        });
    }
});
exports.topRate = topRate;
