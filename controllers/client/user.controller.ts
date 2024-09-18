import {Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/user.model";
import Credential from "../../models/credential.model";
import sendMail from "../../helpers/send-mail.helper";
import VerificationToken from "../../models/verification-token.model";
import { Op } from "sequelize";


//[GET] /user/login
export const login = async (req: Request, res: Response) => {
    
    console.log(req.body);
    const {username, password} = req.body;

    try {
        const credential = await Credential.findOne({
            where: {
                username: username
            },
            raw: true
        });

        // console.log(credential);
        // console.log(credential["is_enabled"][0]); 

        if (!credential || credential["is_enabled"][0] !== 1) {
            return res.json({ 
                code: 400,
                message: 'Account not enabled or invalid.' 
            });
        }

        const isValidPassword = await bcrypt.compare(password, credential["password"]);

        if(!isValidPassword)
        {
            return res.json(
                { 
                    code: 400,
                    message: 'Invalid password.' 
                });
        }

        const token = jwt.sign({ credential_id: credential["credential_id"]}, process.env.SECRET_KEY, { expiresIn: '24h' });

        // lưu token lại
        const verifycation_data = {
            credential_id: credential["credential_id"],
            token_type: "login",
            verif_token: token,
            expire_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

        // console.log(verifycation_data);

        await VerificationToken.create(verifycation_data);

        return res.json({
            code: 200,
            token: token
        });

    } catch (error) {
        return res.json({ 
            code: "400",
            message: 'Error ( login ): ', 
        });
    }
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

        const verifycation_data = {
            credential_id: user.dataValues.credential_id,
            token_type: "activation",
            verif_token: verificationToken,
            expire_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

        console.log(verifycation_data);

        await VerificationToken.create(verifycation_data);

        const content = `<p>Please click the link to verify your email: <a href="${verificationLink}">Xác nhận</a></p>`;
        sendMail(user.dataValues.email, 'Verify Email', content);

        return res.json({ 
            code: 200,
            message: 'Registration successful! Check your email to verify your account.' 
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: 'Failed to send verification email.' 
        });
    }    
}

//[GET] /user/verify-email
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const token = req.query.token;

        // xác định token là loại xác minh hay đăng nhập
        const isActiveToken = await VerificationToken.findOne({
            where:{
                verif_token: token,
                token_type: "activation",
                expire_date: {
                    [Op.gt]: new Date(),
                }
            },  
            raw: true
        });

        if(!isActiveToken)
        {
            return res.json({
                code: 400,
                message: "Invalid token"
            })
        }

        // end xác định token là loại xác minh hay đăng nhập

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const {credential_id} = decoded;

        await Credential.update({
            is_enabled: 1
        }, {
            where: {
                credential_id: credential_id,
            }
        })

        await VerificationToken.update({
            expire_date: '2023-01-01 00:00:00'
        }, {
            where: {
                verification_token_id: isActiveToken["verification_token_id"]
            }
        })

        return res.json({
            code: 200,
            message: "Email verified! You can now log in.",
        })
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.json({ 
                code: 400,
                message: "Token expired. Please request a resend of verification email."
            });
        }
        else
        {
            return res.json({
                code: 400,
                message: "Invalid or expired token",
            });
        }
    }
}

//[GET] /user/logout
export const logout = async (req: Request, res: Response) => {
    try {
        // const token = req["cookies"].token;

        // console.log(req.headers)

        if(req.headers['authorization'])
        {
            const token = req.headers['authorization'].split(" ")[1];

            console.log(token);

            const vertificationToken_data = await VerificationToken.findOne({
                where:{
                    verif_token: token,
                    token_type: "login"
                }
            });

            console.log(vertificationToken_data);
            
            await VerificationToken.update({
                expire_date: '2023-01-01 00:00:00'
            }, {
                where:{
                    verif_token: token,
                    token_type: "login"
                }
            })

            return res.json({
                code: 200,
                message: "User logged out.",
            })
        }

    } catch (error) {
        return res.json({
            code: 400,
            message: "Error - logout"
        })
    }
}