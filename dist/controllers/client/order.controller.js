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
const cart_model_1 = __importDefault(require("../../models/cart.model"));
const cart_item_model_1 = __importDefault(require("../../models/cart_item.model"));
const product_model_1 = __importDefault(require("../../models/product.model"));
const order_item_model_1 = __importDefault(require("../../models/order-item.model"));
const order_model_1 = __importDefault(require("../../models/order.model"));
const sequelize_1 = require("sequelize");
const payment_model_1 = __importDefault(require("../../models/payment.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { fullName, phone, address, note } = req.body["infoCustomer"];
        const ids = req.body["data_ids"];
        const cart_id = req.body["cart_id"];
        console.log(cart_id);
        console.log(ids);
        console.log(req.body);
        const cart = yield cart_model_1.default.findOne({
            where: {
                cart_id: cart_id
            },
            raw: true,
        });
        if (!cart) {
            return res.json({
                code: 404,
                message: "Giỏ hàng không tồn tại!"
            });
        }
        const cartItems = yield cart_item_model_1.default.findAll({
            where: {
                cart_item_id: {
                    [sequelize_1.Op.in]: ids,
                }
            },
            raw: true,
        });
        console.log(cartItems);
        if (cartItems.length === 0) {
            return res.json({
                code: 400,
                message: "Giỏ hàng trống!"
            });
        }
        let totalPrice = 0;
        const orders = yield order_model_1.default.create({
            cart_id: cart_id,
            order_date: new Date(),
            order_desc: note,
            order_fee: totalPrice,
            fullName: fullName,
            phone: phone,
            address: address
        });
        for (const item of cartItems) {
            const infoProduct = yield product_model_1.default.findOne({
                where: {
                    product_id: item["product_id"],
                },
                raw: true,
            });
            const newPrice = Math.ceil(infoProduct["price_unit"] * (1 - infoProduct["discount"] / 100));
            const totalPriceItem = newPrice * item["ordered_quantity"];
            totalPrice += totalPriceItem;
            yield order_item_model_1.default.create({
                order_id: orders.dataValues["order_id"],
                product_id: infoProduct["product_id"],
                ordered_quantity: item["ordered_quantity"],
                price_unit: infoProduct["price_unit"],
                discount: infoProduct["discount"]
            });
            yield product_model_1.default.decrement("quantity", {
                by: item["ordered_quantity"],
                where: {
                    product_id: infoProduct["product_id"],
                }
            });
        }
        yield order_model_1.default.update({
            order_fee: totalPrice,
        }, {
            where: {
                order_id: orders.dataValues["order_id"]
            }
        });
        yield cart_item_model_1.default.destroy({
            where: {
                cart_item_id: {
                    [sequelize_1.Op.in]: ids,
                }
            }
        });
        yield payment_model_1.default.create({
            order_id: orders.dataValues["order_id"],
            is_payed: 0,
            payment_status: "Đang xử lý",
        });
        return res.json({
            code: 200,
            message: "Đặt hàng thành công!",
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi đặt hàng"
        });
    }
});
exports.index = index;
