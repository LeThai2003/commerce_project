import { Request, Response } from "express";
import { DATE, Op, where } from "sequelize";

import { Vonage } from '@vonage/server-sdk';
import { Auth } from '@vonage/auth';
import { generateRandomNumber } from '../../helpers/generate.helper';
import PhoneVerification from '../../models/phoneVerification .model';

const vonage = new Vonage(
    new Auth({
        apiKey: "d6f5a51a",
        apiSecret: "0wkawMKbUYFkpPhI"
    })
);

//[POST] /sendOTP
export const sendOTP = async (req: Request, res: Response) => {
    try {
        let {phone} = req.body["infoCustomer"];
        const otp = generateRandomNumber(6);

        await PhoneVerification.create({ 
            phone: phone, 
            otp: otp, 
            expiresAt: new Date(Date.now() + 5 * 60000) 
        });
    
        // Gửi OTP qua SMS
        const from = "SHOP..."
        const to = phone
        const text = `Mã xác thực số điện thoại bạn là <b>${otp}</b>. Vui lòng không chia sẻ mã cho ai! <i>Mã có hiệu lực 5 phút</i>`

        async function sendSMS() {
            await vonage.sms.send({to, from, text})
                .then(resp => { return res.json({code: 200, messsage: 'Gửi tin nhắn thành công!'})})
                .catch(err => { return res.json({code: 400, messsage: 'Gửi tin nhắn thất bại!'})});
        }

        sendSMS();
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi gửi tin nhắn"
        })
    }
}

//[POST] /verifyOTP
export const verifyOTP = async (req: Request, res: Response) => {
    try {
        let {phone} = req.body["infoCustomer"];
        let {opt} = req.body["otp"];
        const record = await PhoneVerification.findOne({
            where: { 
                phone: phone, 
                otp: opt, 
                expiresAt: { 
                    [Op.gt]: new Date(Date.now()) 
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
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi xác thực"
        })
    }
}