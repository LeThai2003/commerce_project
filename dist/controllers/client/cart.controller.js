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
exports.add = void 0;
const cart_model_1 = __importDefault(require("../../models/cart.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const cart_item_model_1 = __importDefault(require("../../models/cart_item.model"));
const product_model_1 = __importDefault(require("../../models/product.model"));
const add = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { product_id, ordered_quantity } = req.body;
        console.log(product_id);
        console.log(ordered_quantity);
        const credential_id = req["credential_id"];
        const user = yield user_model_1.default.findOne({
            where: {
                credential_id: credential_id,
            },
            raw: true,
        });
        let cart = yield cart_model_1.default.findOne({
            where: {
                user_id: user["user_id"]
            },
            raw: true,
        });
        if (!cart) {
            cart = yield cart_model_1.default.create({
                user_id: user["user_id"]
            });
        }
        ;
        let cartItem = yield cart_item_model_1.default.findOne({
            where: {
                cart_id: cart["cart_id"],
                product_id: parseInt(product_id)
            },
            raw: true,
        });
        console.log(cartItem);
        const product = yield product_model_1.default.findOne({
            where: {
                product_id: parseInt(product_id)
            },
            raw: true,
        });
        if (cartItem) {
            if (cartItem["ordered_quantity"] + ordered_quantity > product["quantity"]) {
                return res.json({
                    code: 400,
                    message: `Số lượng đặt hàng không được vượt quá ${product["quantity"]}`
                });
            }
            ;
            yield cart_item_model_1.default.update({
                ordered_quantity: cartItem["ordered_quantity"] + ordered_quantity
            }, {
                where: {
                    cart_id: cart["cart_id"],
                    product_id: cartItem["product_id"]
                }
            });
        }
        else {
            yield cart_item_model_1.default.create({
                cart_id: cart["cart_id"],
                product_id: product_id,
                ordered_quantity: ordered_quantity
            });
        }
        res.json({
            code: 200,
            message: "Thêm sản phẩm vào giỏ hàng thành công!",
            cartItem: cartItem,
        });
    }
    catch (error) {
        res.json({
            code: 400,
            message: "Lỗi thêm sản phẩm vào giỏ hàng"
        });
    }
});
exports.add = add;
