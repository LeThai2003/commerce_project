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
exports.changeStatus = exports.statusPayment = exports.index = void 0;
const pagination_helper_1 = require("../../helpers/pagination.helper");
const sequelize_1 = require("sequelize");
const order_model_1 = __importDefault(require("../../models/order.model"));
const payment_model_1 = __importDefault(require("../../models/payment.model"));
const address_model_1 = __importDefault(require("../../models/address.model"));
const paymentStatus_model_1 = __importDefault(require("../../models/paymentStatus.model"));
const product_model_1 = __importDefault(require("../../models/product.model"));
const order_item_model_1 = __importDefault(require("../../models/order-item.model"));
const cart_model_1 = __importDefault(require("../../models/cart.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listOrder = yield order_model_1.default.findAll({
            where: {
                deleted: false
            },
            raw: true
        });
        for (const item of listOrder) {
            const infoPayment = yield payment_model_1.default.findOne({
                where: {
                    order_id: item["order_id"]
                },
                raw: true
            });
            const paymentStatus = yield paymentStatus_model_1.default.findOne({
                where: {
                    id: infoPayment["payment_status"]
                },
                raw: true
            });
            console.log(paymentStatus);
            infoPayment["payment_status"] = paymentStatus["status"];
            infoPayment["payment_status_id"] = paymentStatus["id"];
            console.log(infoPayment);
            item["infoPayment"] = infoPayment;
            const infoAddress = yield address_model_1.default.findOne({
                where: {
                    address_id: item["address"]
                },
                raw: true
            });
            console.log(infoAddress);
            item["address"] = infoAddress["address_name"];
            const cart = yield cart_model_1.default.findOne({
                where: {
                    cart_id: item["cart_id"]
                },
                raw: true
            });
            const user = yield user_model_1.default.findOne({
                where: {
                    user_id: cart["user_id"],
                },
                attributes: { exclude: ['deleted', 'createdAt', 'updatedAt'] },
                raw: true
            });
            item["infoUser"] = user;
        }
        const objectPagination = (0, pagination_helper_1.paginationHelper)(req, listOrder.length);
        const paginatedOrders = listOrder.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);
        return res.json({
            code: 200,
            message: "Lấy danh sách contacts thành công",
            data: paginatedOrders,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"]
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy danh sách contacts " + error
        });
    }
});
exports.index = index;
const statusPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listStatus = yield paymentStatus_model_1.default.findAll({ raw: true });
        return res.json({
            code: 200,
            message: "Lấy danh sách trạng thái thành công",
            data: listStatus
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy danh sách trạng thái " + error
        });
    }
});
exports.statusPayment = statusPayment;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const statusId = parseInt(req.params["statusId"]);
        const orderId = parseInt(req.params["orderId"]);
        if (statusId == 8 || statusId == 9) {
            const orderItems = yield order_item_model_1.default.findAll({
                where: {
                    order_id: orderId
                },
                raw: true
            });
            for (const item of orderItems) {
                const infoProduct = yield product_model_1.default.findOne({
                    where: {
                        product_id: item["product_id"]
                    },
                    raw: true
                });
                yield product_model_1.default.increment("quantity", {
                    by: item["ordered_quantity"],
                    where: {
                        product_id: infoProduct["product_id"],
                    }
                });
                yield order_item_model_1.default.destroy({
                    where: {
                        [sequelize_1.Op.and]: [{ order_id: orderId }, { product_id: infoProduct["product_id"] }],
                    }
                });
                yield payment_model_1.default.update({
                    payment_status: statusId
                }, {
                    where: {
                        order_id: orderId
                    }
                });
            }
        }
        else {
            yield payment_model_1.default.update({
                payment_status: statusId
            }, {
                where: {
                    order_id: orderId
                }
            });
        }
        return res.json({
            code: 200,
            message: "Thay đổi trạng thái thành công",
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi thay đổi trạng thái " + error
        });
    }
});
exports.changeStatus = changeStatus;
