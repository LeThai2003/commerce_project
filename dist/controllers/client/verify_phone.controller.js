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
exports.verifyOTP = exports.sendOTP = void 0;
const sequelize_1 = require("sequelize");
const server_sdk_1 = require("@vonage/server-sdk");
const auth_1 = require("@vonage/auth");
const generate_helper_1 = require("../../helpers/generate.helper");
const phoneVerification__model_1 = __importDefault(require("../../models/phoneVerification .model"));
const vonage = new server_sdk_1.Vonage(new auth_1.Auth({
    apiKey: "d6f5a51a",
    apiSecret: "0wkawMKbUYFkpPhI"
}));
const sendOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { phone } = req.body["infoCustomer"];
        const otp = (0, generate_helper_1.generateRandomNumber)(6);
        yield phoneVerification__model_1.default.create({
            phone: phone,
            otp: otp,
            expiresAt: new Date(Date.now() + 5 * 60000)
        });
        const from = "SHOP...";
        const to = phone;
        const text = `Mã xác thực số điện thoại bạn là <b>${otp}</b>. Vui lòng không chia sẻ mã cho ai! <i>Mã có hiệu lực 5 phút</i>`;
        function sendSMS() {
            return __awaiter(this, void 0, void 0, function* () {
                yield vonage.sms.send({ to, from, text })
                    .then(resp => { return res.json({ code: 200, messsage: 'Gửi tin nhắn thành công!' }); })
                    .catch(err => { return res.json({ code: 400, messsage: 'Gửi tin nhắn thất bại!' }); });
            });
        }
        sendSMS();
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi gửi tin nhắn"
        });
    }
});
exports.sendOTP = sendOTP;
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { phone } = req.body["infoCustomer"];
        let { opt } = req.body["otp"];
        const record = yield phoneVerification__model_1.default.findOne({
            where: {
                phone: phone,
                otp: opt,
                expiresAt: {
                    [sequelize_1.Op.gt]: new Date(Date.now())
                }
            },
        });
        if (!record) {
            return res.json({
                code: 400,
                message: "Mã OTP không hợp lệ hoặc đã hết hạn."
            });
        }
        return res.json({
            code: 200,
            message: "Xác thực thành công!",
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi xác thực"
        });
    }
});
exports.verifyOTP = verifyOTP;
