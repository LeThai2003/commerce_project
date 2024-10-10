"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductValidation = void 0;
const createProductValidation = (req, res, next) => {
    console.log("Chạy vào đây!");
    if (!req.body["product_title"].trim()) {
        return res.json({
            code: 400,
            message: "Tiêu đề không để trống"
        });
    }
    if (!parseInt(req.body["price_unit"])) {
        return res.json({
            code: 400,
            message: "Tiền không được để trống"
        });
    }
    if (!parseInt(req.body["quantity"])) {
        return res.json({
            code: 400,
            message: "Số lượng không được để trống"
        });
    }
    next();
};
exports.createProductValidation = createProductValidation;
