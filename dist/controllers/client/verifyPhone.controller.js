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
const generate_helper_1 = require("../../helpers/generate.helper");
const follow_redirects_1 = require("follow-redirects");
const phoneVerification__model_1 = __importDefault(require("../../models/phoneVerification .model"));
const sequelize_1 = require("sequelize");
const sendOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let phone = req.body["phone"];
        phone = '84' + phone.slice(1, phone.length);
        console.log(phone);
        const otp = (0, generate_helper_1.generateRandomNumber)(6);
        const sendOTP = (phone, otp) => {
            const options = {
                'method': 'POST',
                'hostname': 'v33emr.api.infobip.com',
                'path': '/sms/2/text/advanced',
                'headers': {
                    'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                'maxRedirects': 20
            };
            const req = follow_redirects_1.https.request(options, function (res) {
                let chunks = [];
                res.on("data", chunk => chunks.push(chunk));
                res.on("end", () => {
                    const body = Buffer.concat(chunks);
                    console.log(`SMS Sent: ${body.toString()}`);
                });
                res.on("error", error => console.error(error));
            });
            const postData = JSON.stringify({
                "messages": [
                    {
                        "destinations": [{ "to": phone }],
                        "from": "Shop...",
                        "text": `Your OTP is: ${otp}. Expired in 5 minutes`
                    }
                ]
            });
            req.write(postData);
            req.end();
        };
        sendOTP(phone, otp);
        yield phoneVerification__model_1.default.create({
            phone: phone,
            otp: otp,
            expiresAt: new Date(Date.now() + 5 * 60000)
        });
        return res.json({
            code: 200,
            message: "Gửi mã otp thành công"
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi gửi tin nhắn" + error
        });
    }
});
exports.sendOTP = sendOTP;
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let phone = req.body["phone"];
        phone = '84' + phone.slice(1, phone.length);
        let opt = req.body["otp"];
        console.log(phone);
        console.log(opt);
        const record = yield phoneVerification__model_1.default.findOne({
            where: {
                phone: phone,
                otp: opt,
                expiresAt: {
                    [sequelize_1.Op.gt]: new Date(Date.now())
                },
                verify_phone_number: false,
            },
            raw: true
        });
        if (!record) {
            return res.json({
                code: 400,
                message: "Mã OTP không hợp lệ hoặc đã hết hạn."
            });
        }
        yield phoneVerification__model_1.default.update({
            verify_phone_number: true
        }, {
            where: {
                id: record["id"]
            }
        });
        return res.json({
            code: 200,
            message: "Xác thực thành công!",
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi xác thực " + error
        });
    }
});
exports.verifyOTP = verifyOTP;
