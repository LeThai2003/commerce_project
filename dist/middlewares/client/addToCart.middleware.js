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
const product_model_1 = __importDefault(require("../../models/product.model"));
const addToCard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { product_id, ordered_quantity } = req.body;
        const product = yield product_model_1.default.findOne({
            where: {
                product_id: parseInt(product_id)
            },
            raw: true,
        });
        if (!product) {
            return res.json({
                code: 404,
                message: "Sản phẩm không tồn tại"
            });
        }
        if (ordered_quantity > product["quantity"]) {
            return res.json({
                code: 400,
                message: `Số lượng đặt hàng không được vượt quá ${product["quantity"]}`
            });
        }
        next();
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi số lượng thêm vào giỏ hàng"
        });
    }
});
exports.default = addToCard;
