import { Request, Response } from "express";
import Role from "../../models/roles.model";
import Admin from "../../models/admin.model";
import { Op, QueryTypes } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Credential from "../../models/credential.model";
import VerificationToken from "../../models/verification-token.model";
import sequelize from "../../configs/database";
import sendMail from "../../helpers/send-mail.helper";
import systemConfig from "../../configs/systemConfig";

//[GET] /admin/accounts
export const index = async (req: Request, res: Response) => {
    try {
        const accounts = await sequelize.query(
            `
                SELECT admins.first_name, admins.last_name, admins.image_url, admins.phone, admins.email FROM 
                admins join credentials on admins.credential_id = credentials.credential_id
                    where credentials.is_enabled != 0
            `, {
                raw: true,
                type: QueryTypes.SELECT,
          });

        return res.json({
            code: 200,
            message: "Lấy danh sách roles",
            data: accounts
        });
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi lấy danh sách roles" +error
        });
    }
}

//[GET] /admin/accounts/create
export const getCreate = async (req: Request, res: Response) => {
    try {
        const roles = await Role.findAll({
            where:{
                deleted: false,
                role_id:{
                    [Op.ne]: 12 // user
                }
            },
            raw: true
        })

        return res.json({
            code: 200,
            message: "Dữ liệu các nhóm quyền",
            data: roles
        });
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi lấy danh sách roles" +error
        });
    }
}

//[POST] /admin/accounts/create
export const createPost = async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        const {email, password, role_id, first_name, last_name, phone, image_url } = req.body;

        // kiểm tra email trùng 
        const userExist = await Admin.findOne({
            where: {
                email: email
            },
            raw: true,
        });

        if(userExist)
        {
            return res.json({ 
                code: "409",
                message: 'email trùng' 
            });
        }

        // mã hóa mật khẩu - lưu thông tin vào database 
        const hashPassword = await bcrypt.hash(password, 10);

        const data_credential = {
            username: email,
            password: hashPassword,
            role_id: parseInt(role_id),
            is_enabled: true
        };

        const credential = await Credential.create(data_credential);

        const credential_id = credential.dataValues.credential_id;

        const data_admin = {
            credential_id: credential_id,
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone: phone || "",
            image_url: image_url || ""
        }

        const admin = await Admin.create(data_admin);

        return res.json({
            code: 200,
            message: "Tạo tài khoản thành công, bạn có thể đăng nhập"
        });
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi tạo tài khoản" +error
        });
    }
}

//[POST] /admin/accounts/login
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

        // Tạo access token
        const accessToken = jwt.sign({ credential_id: credential["credential_id"] }, process.env.SECRET_KEY, { expiresIn: '24h' });

        // Tạo refresh token
        const refreshToken = jwt.sign({ credential_id: credential["credential_id"] }, process.env.SECRET_KEY, { expiresIn: '7d' });


        const token = jwt.sign({ credential_id: credential["credential_id"]}, process.env.SECRET_KEY, { expiresIn: '12h' });

        // lưu token lại
        const verifycation_data = {
            credential_id: credential["credential_id"],
            token_type: "access",
            verif_token: accessToken,
            expire_date: new Date(Date.now() + 12 * 60 * 60 * 1000)
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
            message: 'Error ( login ): ', 
        });
    }
}

//[PATCH] /admin/accounts/logout
export const logout = async (req: Request, res: Response) => {
    try {
        // access token
        const accessToken = req.headers["authorization"].split(" ")[1];

        const credential_id = jwt.verify(accessToken, process.env.SECRET_KEY);

        await VerificationToken.destroy({
            where: {
                credential_id: credential_id,
                token_type: {
                    [Op.or]: ["access", "refresh"]
                }
            }
        })

        return res.json({
            code: 200,
            message: "User logged out successfully.",
        })
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi đăng xuất tài khoản" +error
        });
    }
}

//[POST] /user/password/forgot
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const email = req.body.email;
        
        console.log(email);

        const credential = await sequelize.query(`
            SELECT credentials.credential_id 
            FROM credentials JOIN admins ON credentials.credential_id = admins.credential_id
            WHERE 
                admins.email = '${email}'
            `, {
                type: QueryTypes.SELECT,
                raw: true
            }
        );

        const credential_id = credential[0]["credential_id"];

        console.log(credential_id);

        // xác thực email bằng JWT token
        const verificationToken = jwt.sign({credential_id}, process.env.SECRET_KEY, {expiresIn: "24h"});
        const verificationLink = `http://localhost:3000${systemConfig["base_path"]}/password/otp?token=${verificationToken}`;

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

//[POST] /admin/password/otp
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
                code: 401,
                message: "Invalid token"
            })
        }

        // end xác định token là loại xác minh hay đăng nhập

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const {credential_id} = decoded;

        const admin = await sequelize.query(`
            SELECT admins.email 
            FROM admins JOIN credentials ON admins.credential_id = credentials.credential_id
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
            message: "OTP authentication successful! You can reset your password",
            email: admin[0]["email"]
        })
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.json({ 
                code: 400,
                message: "Token expired. Please request a resend of verification email"
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

//[POST] /admin/password/reset
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const {email, password, comfirmPassword} = req.body;

        // kiểm tra tạm ở đây -- chưa làm trang validate dữ liệu
        if(password !== comfirmPassword)
        {
            return res.json({ 
                code: 401,
                message: "Password and confirm password are not the same."
            });
        }

        // mã hóa mật khẩu - lưu thông tin vào database 
        const hashPassword = await bcrypt.hash(password, 10);

        const admin = await Admin.findOne({
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
                credential_id: admin["credential_id"]
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