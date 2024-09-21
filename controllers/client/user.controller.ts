import {Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/user.model";
import Credential from "../../models/credential.model";
import sendMail from "../../helpers/send-mail.helper";
import VerificationToken from "../../models/verification-token.model";
import { DATE, Op, QueryTypes } from "sequelize";
import sequelize from "../../configs/database";
import { emit } from "process";


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
            message: 'Failed - register' 
        });
    }    
}

//[GET] /user/verify-email
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const token = req.query.token;

        // xác định token là loại xác minh 
        const isActiveToken = await VerificationToken.findOne({
            where:{
                verif_token: token,
                token_type: "activation",
                expire_date: {
                    [Op.gt]: new Date(Date.now()),
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

//[POST] /user/password
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const email = req.body.email;
        
        console.log(email);

        const credential = await sequelize.query(`
            SELECT credentials.credential_id 
            FROM credentials JOIN users ON credentials.credential_id = users.credential_id
            WHERE 
                users.email = '${email}'
            `, {
                type: QueryTypes.SELECT,
                raw: true
            }
        );

        const credential_id = credential[0]["credential_id"];

        console.log(credential_id);

        // xác thực email bằng JWT token
        const verificationToken = jwt.sign({credential_id}, process.env.SECRET_KEY, {expiresIn: "24h"});
        const verificationLink = `http://localhost:3000/user/password/otp?token=${verificationToken}`;

        const verifycation_data = {
            credential_id: credential_id,
            token_type: "forgot_password",
            verif_token: verificationToken,
            expire_date: new Date(Date.now() + 5 * 60 * 1000)
        };

        // console.log(new Date(Date.now()));
        // console.log(verifycation_data);

        await VerificationToken.create(verifycation_data);

        const content = `<p>Please click <a href="${verificationLink}">confirm</a> to reset your password. If it's not you, click report!</p>`;
        sendMail(email, 'Confirm forgot password', content);

        return res.json({
            code: 200,
            message: 'Email sent successfully! Check your email.' 
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: 'Failed forgot password.' 
        });
    }
}

//[GET] /user/password/otp
export const passwordOtp = async (req: Request, res: Response) => {
    try {
        const token = req.query.token;

        // xác định token là loại xác minh 
        const isActiveToken = await VerificationToken.findOne({
            where:{
                verif_token: token,
                token_type: "forgot_password",
                expire_date: {
                    [Op.gt]: new Date(Date.now()),
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

        const users = await sequelize.query(`
            SELECT users.email 
            FROM users JOIN credentials ON users.credential_id = credentials.credential_id
            WHERE
                credentials.credential_id = ${credential_id}
            `, {
                type: QueryTypes.SELECT,
                raw: true
        })

        // console.log(users[0]["email"]);

        await VerificationToken.update({
            expire_date: '2023-01-01 00:00:00'
        }, {
            where: {
                verification_token_id: isActiveToken["verification_token_id"]
            }
        })

        return res.json({
            code: 200,
            message: "OTP authentication successful! You can reset your password.",
            email: users[0]["email"]
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

//[POST] /user/password/reset
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const {email, password, comfirmPassword} = req.body;

        // kiểm tra tạm ở đây -- chưa làm trang validate dữ liệu
        if(password !== comfirmPassword)
        {
            return res.json({ 
                code: 400,
                message: "Password and confirm password are not the same."
            });
        }

        // mã hóa mật khẩu - lưu thông tin vào database 
        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.findOne({
            where: {
                email: email
            },
            raw: true
        });

        // console.log(user);

        await Credential.update({
            password: hashPassword,
        }, {
            where: {
                credential_id: user["credential_id"]
            }
        })

        return res.json({
            code: 200,
            message: "Reset password successfully! You can login now."
        })
    } catch (error) {
        return res.json({ 
            code: 400,
            message: "Error in reset password."
        });
    }
}