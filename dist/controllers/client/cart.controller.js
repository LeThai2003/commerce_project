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
exports.deleteItem = exports.updateQuantity = exports.add = exports.index = void 0;
const cart_model_1 = __importDefault(require("../../models/cart.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const cart_item_model_1 = __importDefault(require("../../models/cart_item.model"));
const product_model_1 = __importDefault(require("../../models/product.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
            return res.json({
                code: 401,
                message: "Giỏ hàng không tồn tại"
            });
        }
        ;
        const cartItems = yield cart_item_model_1.default.findAll({
            where: {
                cart_id: cart["cart_id"],
            },
            raw: true,
        });
        if (cartItems.length === 0) {
            return res.json({
                code: 400,
                message: "Giỏ hàng tróng!"
            });
        }
        let totalPrice = 0;
        for (const item of cartItems) {
            const infoProduct = yield product_model_1.default.findOne({
                where: {
                    product_id: item["product_id"],
                },
                raw: true,
            });
            item["infoProduct"] = infoProduct;
            const newPrice = Math.ceil(infoProduct["price_unit"] * (1 - infoProduct["discount"] / 100));
            const totalPriceItem = newPrice * item["ordered_quantity"];
            totalPrice += totalPriceItem;
            item["newPrice"] = newPrice;
            item["totalPriceItem"] = totalPriceItem;
        }
        return res.json({
            code: 200,
            cart_id: cart["cart_id"],
            data: cartItems,
            totalPrice: totalPrice,
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy sản phẩm giỏ hàng"
        });
    }
});
exports.index = index;
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
        return res.json({
            code: 200,
            message: "Thêm sản phẩm vào giỏ hàng thành công!",
            cartItem: cartItem,
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi thêm sản phẩm vào giỏ hàng"
        });
    }
});
exports.add = add;
const updateQuantity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cart_id, product_id, ordered_quantity } = req.body;
        console.log(cart_id);
        console.log(product_id);
        console.log(ordered_quantity);
        const cartItem = yield cart_item_model_1.default.findOne({
            where: {
                cart_id: cart_id,
                product_id: product_id,
            },
            raw: true,
        });
        if ((cartItem["ordered_quantity"] === 1) && (ordered_quantity === -1)) {
            return res.json({
                code: 400,
                message: "Bạn muốn xóa sản phẩm ?"
            });
        }
        else {
            yield cart_item_model_1.default.update({
                ordered_quantity: ordered_quantity + cartItem["ordered_quantity"]
            }, {
                where: {
                    cart_item_id: cartItem["cart_item_id"]
                }
            });
        }
        return res.json({
            code: 200,
            message: "Cập nhật số lượng sản phẩm trong giỏ hàng thành công"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi cập nhật số lượng sản phẩm trong giỏ hàng"
        });
    }
});
exports.updateQuantity = updateQuantity;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cart_item_id } = req.params;
        console.log(cart_item_id);
        yield cart_item_model_1.default.destroy({
            where: {
                cart_item_id: parseInt(cart_item_id),
            },
        });
        return res.json({
            code: 200,
            message: "Xóa sản phẩm trong giỏ hàng thành công"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi xóa sản phẩm trong giỏ hàng"
        });
    }
});
exports.deleteItem = deleteItem;