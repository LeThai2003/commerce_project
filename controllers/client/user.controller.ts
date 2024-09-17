import {Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/user.model";
import Credential from "../../models/credential.model";
import sendMail from "../../helpers/send-mail.helper";


//[GET] /user/login
export const login = (req: Request, res: Response) => {
    
    console.log(req.body);

    res.json({
        hello: "Xin chào"
    });
}

//[POST] /user/register
export const register = async (req: Request, res: Response) => {
    
    try {
        console.log(req.body);
        const { username, password, first_name, last_name, email, phone } = req.body;

        // kiểm tra email trùng 
        const userExist = await User.findOne({
            where: {
                email: email
            },
            raw: true,
        });

        if(userExist)
        {
            return res.json({ 
                code: "400",
                message: 'Email already registered.' 
            });
        }

        // mã hóa mật khẩu - lưu thông tin vào database 
        const hashPassword = await bcrypt.hash(password, 10);

        const data_credential = {
            username: username,
            password: hashPassword,
            role: "user"
        };

        const credential = await Credential.create(data_credential);

        const credential_id = credential.dataValues.credential_id;

        const data_user = {
            credential_id: credential_id,
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone: phone
        }

        const user = await User.create(data_user);

        
        // sau khi lưu - xác thực email bằng JWT token
        const verificationToken = jwt.sign({credential_id}, process.env.SECRET_KEY, {expiresIn: "24h"});
        const verificationLink = `http://localhost:3000/user/verify-email?token=${verificationToken}`;

        const content = `<p>Please click the link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`;
        sendMail(user.dataValues.email, 'Verify Email', content);

        res.json({ 
            code: 200,
            message: 'Registration successful! Check your email to verify your account.' 
        });
    } catch (error) {
        res.json({
            code: 400,
            message: 'Failed to send verification email.' 
        });
    }    
}

//[GET] /user/verify-email
export const verifyEmail = async (req: Request, res: Response) => {

    const token = req.query.token;

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const {credential_id} = decoded;

        await Credential.update({
            is_enabled: 1
        }, {
            where: {
                credential_id: credential_id,
            }
        })

        res.json({
            code: 200,
            message: "Email verified! You can now log in.",
        })
    } catch (error) {
    res.json({
        code: 400,
        message: "Invalid or expired token",
    });
    }
}