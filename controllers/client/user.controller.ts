import {Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { TokenExpiredError } from 'jsonwebtoken';
import User from "../../models/user.model";
import Credential from "../../models/credential.model";
import sendMail from "../../helpers/send-mail.helper";
import VerificationToken from "../../models/verification-token.model";
import { DATE, Op, or, QueryTypes } from "sequelize";
import sequelize from "../../configs/database";
import { generateRandomNumber } from "../../helpers/generate.helper";
import ForgotPassword from "../../models/forgotPassword.model";
import Role from "../../models/roles.model";


//[POST] /user/login
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
                code: 403,
                message: 'Tài khoản bị vô hiệu hóa' 
            });
        }

        const isValidPassword = await bcrypt.compare(password, credential["password"]);

        if(!isValidPassword)
        {
            return res.json(
                { 
                    code: 401,
                    message: 'Mật khẩu không đúng' 
                });
        }

        const role = await Role.findOne({
            where: {
                role_id: credential['role_id']
            },
            raw: true
        })

        // Tạo access token
        const accessToken = jwt.sign({ credential_id: credential["credential_id"], role: role['title']}, process.env.SECRET_KEY, { expiresIn: '12h' });

        // Tạo refresh token
        const refreshToken = jwt.sign({ credential_id: credential["credential_id"],role: role['title']}, process.env.SECRET_KEY, { expiresIn: '7d' });

        // lưu token lại
        const verifycation_data = {
            credential_id: credential["credential_id"],
            token_type: "access",
            verif_token: accessToken,
            expire_date: new Date(Date.now() + 12 * 60 * 60 * 1000)
            // expire_date: new Date(Date.now() + 1000)
        };


        const refreshTokenData = {
            credential_id: credential["credential_id"],
            token_type: "refresh",
            verif_token: refreshToken,
            expire_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        // Trước khi lưu - Xóa hết token cũ của người đó đi
        await VerificationToken.destroy({
            where:{
                credential_id: credential["credential_id"],
                token_type: {
                    [Op.or]: ["refresh", "access"]
                }
            }
        })
        // end Trước khi lưu - Xóa hết token cũ của người đó đi

        await VerificationToken.create(verifycation_data);
        await VerificationToken.create(refreshTokenData);
        
        return res.json({
            code: 200,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });

    } catch (error) {
        return res.json({ 
            code: "400",
            message: 'Error ( login ): ' + error, 
        });
    }
}

//[POST] /user/register
export const register = async (req: Request, res: Response) => {
    
    try {
        console.log(req.body);
        const { username, password, first_name, last_name, email, phone, image_url } = req.body;

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
                code: "409",
                message: 'Email đã được đăng ký' 
            });
        }

        // mã hóa mật khẩu - lưu thông tin vào database 
        const hashPassword = await bcrypt.hash(password, 10);

        const data_credential = {
            username: username,
            password: hashPassword,
            role_id: 12
        };

        const credential = await Credential.create(data_credential);

        const credential_id = credential.dataValues.credential_id;

        const data_user = {
            credential_id: credential_id,
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone: phone,
            image_url: image_url || ""
        }

        const user = await User.create(data_user);

        
        // // sau khi lưu - xác thực email bằng JWT token
        // const verificationToken = jwt.sign({credential_id}, process.env.SECRET_KEY, {expiresIn: "24h"});
        // const verificationLink = `http://localhost:3000/user/verify-email?token=${verificationToken}`;

        // const verifycation_data = {
        //     credential_id: user.dataValues.credential_id,
        //     token_type: "activation",
        //     verif_token: verificationToken,
        //     expire_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        // };

        // console.log(verifycation_data);

        // await VerificationToken.create(verifycation_data);

        // const content = `<p>Please click the link to verify your email: <a href="${verificationLink}">Xác nhận</a></p>`;
        // sendMail(user.dataValues.email, 'Verify Email', content);

        return res.json({ 
            code: 200,
            message: 'Registration successful! You can log in now' 
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: 'Failed - register' 
        });
    }    
}

//[POST] /user/verify-email
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
                code: 401,
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
                code: 401,
                message: "REQUEST A RESEND EMAIL"
            });
        }
        else
        {
            return res.json({
                code: 401,
                message: "Invalid or expired token",
            });
        }
    }
}

//[POST] /user/logout
export const logout = async (req: Request, res: Response) => {
    let accessToken = req.headers["authorization"];
    if(accessToken)
    {
        try {
            // access token
            accessToken = accessToken.split(" ")[1];
    
            const decoded = jwt.decode(accessToken, process.env.SECRET_KEY);
            const { credential_id } = decoded;
    
            await VerificationToken.destroy({
                where:{
                    credential_id: credential_id,
                    token_type: {
                        [Op.or] : ["access", "refresh"]
                    }
                }
            })
    
            return res.json({
                code: 200,
                message: "Đăng xuất tài khoản thành công",
            })
    
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                // Nếu token hết hạn, lấy accessToken mới trong database mới tạo
                const decoded = jwt.decode(accessToken);
                const { credential_id } = decoded;

                // const dataAccess = await VerificationToken.findOne({
                //     where: {
                //         credential_id: credential_id,
                //         token_type: "access"
                //     },
                //     raw: true
                // });

                // const newAccessToken = dataAccess["verif_token"];

                await VerificationToken.destroy({
                    where:{
                        credential_id: credential_id,
                        token_type: {
                            [Op.or] : ["access", "refresh"]
                        }
                    }
                })
        
                return res.json({
                    code: 200,
                    message: "Đăng xuất tài khoản thành công",
                })
            }
            return res.json({
                code: 400,
                message: "Error - logout"
            })
        }
    }
    else
    {
        return res.json({
            code: 400,
            message: "không có accesstoken được truyền lên"
        })
    }
}

//[POST] /user/password
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const email = req.body.email;
        
        console.log(email);

        const emailExist = await User.findOne({
            where: {
                email: email
            },
            raw: true
        });
    
        if(!emailExist)
        {
            return res.json({
                code: 400,
                message: "Email không tồn tại"
            });
        }

        const otp = generateRandomNumber(4);

        // luu vao database
        await ForgotPassword.create({
            email: email,
            otp: otp,
            expiresAt: new Date(Date.now() + 5*60*1000)
        });

        console.log("-----")
        
        const content = `Mã OTP của bạn là <b>${otp}</b>. <i>Mã có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã cho bất kỳ ai!</i>`;
        sendMail(email, 'OTP FORGOT PASSWORD', content);


        return res.json({
            code: 200,
            message: 'Email sent successfully! Check your email',
            email: email
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: 'Failed forgot password. ' + error 
        });
    }
}

//[POST] /user/password/otp
export const passwordOtp = async (req: Request, res: Response) => {
    try {
        const email = req.body.email;
        const otp = req.body.otp;

        const forgotPassword = await ForgotPassword.findOne({
            where: {
                email: email,
                otp: otp,
                expiresAt: {
                    [Op.gte]: new Date(Date.now()),
                },
                verify_otp: false
            },
            raw: true
        });

        if(!forgotPassword)
        {
            res.json({
                code: 400,
                message: "OTP không hợp lệ"
            })
            return;
        }
        else
        {
            await ForgotPassword.update({
                verify_otp: true
            }, {
                where: {
                    forgot_password_id: forgotPassword["forgot_password_id"]
                }
            })
        }

        return res.json({
            code: 200,
            message: "OTP authentication successful! You can reset your password"
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi " + error
        })
    }
}

//[POST] /user/password/reset
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const {email, password, comfirmPassword} = req.body;

        const user = await User.findOne({
            where: {
                email: email
            },
            raw: true
        });

        if(!user)
        {
            return res.json({
                code: 404,
                message: "Người dùng không tồn tại"
            })
        }
        // console.log(user);

        // kiểm tra tạm ở đây -- chưa làm trang validate dữ liệu
        if(password !== comfirmPassword)
        {
            return res.json({ 
                code: 401,
                message: "Password and confirm password are not the same"
            });
        }

        // mã hóa mật khẩu - lưu thông tin vào database 
        const hashPassword = await bcrypt.hash(password, 10);

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

//[POST] /user/refresh-token
export const refreshToken = async (req: Request, res: Response) => {
    const {refreshToken} = req.body;
    if(!refreshToken)
    {
        return res.json({ 
            code: 401,
            message: "Refresh token is required"
        });
    }
    try {
        const tokenData = await VerificationToken.findOne({
            where: {
                verif_token: refreshToken,
                token_type: "refresh",
                expire_date: {
                    [Op.gte]: new Date(Date.now())
                }
            },
            raw: true
        });
        if(!tokenData)
        {
            return res.json({ 
                code: 401,
                message: "Invalid refresh token"
            });
        }

        const credential = await Credential.findOne({
            where:{
                credential_id: tokenData["credential_id"]
            },
            raw: true
        })

        const role = await Role.findOne({
            where: {
                role_id: credential['role_id']
            },
            raw: true
        })
        // Tạo accessToken
        const newAccessToken = jwt.sign({ credential_id: tokenData["credential_id"], role: role['title']}, process.env.SECRET_KEY, { expiresIn: '12h'});

        await VerificationToken.destroy({
            where:{
                token_type: "access",
                credential_id: tokenData["credential_id"],
            }
        });

        const verifycation_data = {
            credential_id: tokenData["credential_id"],
            token_type: "access",
            verif_token: newAccessToken,
            expire_date: new Date(Date.now() + 12 * 60 * 60 * 1000)
            // expire_date: new Date(Date.now() + 1000)
        };

        await VerificationToken.create(verifycation_data)

        return res.json({
            code: 200,
            token: newAccessToken
        });
    } catch (error) {
        return res.json({ 
            code: 400,
            message: "Error refreshing token."
        });
    }
}