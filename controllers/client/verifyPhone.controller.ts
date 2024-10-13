import { Request, Response } from "express";
import { generateRandomNumber } from '../../helpers/generate.helper';
import { https } from "follow-redirects";
import PhoneVerification from "../../models/phoneVerification .model";
import { Op } from "sequelize";

//[POST] /sendOTP
export const sendOTP = async (req: Request, res: Response) => {
    try {
        let phone = req.body["phone"] as string;
        // phone = 0989217177 -> 84989217177
        phone = '84' + phone.slice(1, phone.length);
        console.log(phone);

        const otp = generateRandomNumber(6);

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
        
            const req = https.request(options, function (res) {
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
                        "destinations": [{"to": phone}],  // Số điện thoại người dùng
                        "from": "Shop...",
                        "text": `Your OTP is: ${otp}. Expired in 5 minutes`  // Nội dung tin nhắn với mã OTP
                    }
                ]
            });
        
            req.write(postData);
            req.end();
        }
        sendOTP(phone, otp);
        await PhoneVerification.create({ 
            phone: phone, 
            otp: otp, 
            expiresAt: new Date(Date.now() + 5 * 60000) 
        });
        return res.json({
            code: 200,
            message: "Gửi mã otp thành công"
        })
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi gửi tin nhắn" +error
        })
    }
}


//[POST] /verifyOTP
export const verifyOTP = async (req: Request, res: Response) => {
    try {
        let phone = req.body["phone"] as string;
        // phone = 0989217177 -> 84989217177
        phone = '84' + phone.slice(1, phone.length);
        let opt = req.body["otp"];

        console.log(phone);
        console.log(opt);

        const record = await PhoneVerification.findOne({
            where: { 
                phone: phone, 
                otp: opt, 
                expiresAt: { 
                    [Op.gt]: new Date(Date.now()) 
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

        await PhoneVerification.update({
            verify_phone_number: true
        }, {
            where: {
                id: record["id"]
            }
        })
    
        return res.json({
            code: 200,
            message: "Xác thực thành công!",
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi xác thực " + error
        })
    }
}