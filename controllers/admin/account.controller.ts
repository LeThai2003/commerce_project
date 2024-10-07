import { Request, Response } from "express";
import Role from "../../models/roles.model";
import Admin from "../../models/admin.model";
import { Op, QueryTypes } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Credential from "../../models/credential.model";
import VerificationToken from "../../models/verification-token.model";
import sequelize from "../../configs/database";

//[GET] /admin/accounts
export const index = async (req: Request, res: Response) => {
    try {
        const accounts = await sequelize.query(
            `
                SELECT * FROM 
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
            code: 400,
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
            code: 400,
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
                code: "400",
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

        // Tạo access token
        const accessToken = jwt.sign({ credential_id: credential["credential_id"] }, process.env.SECRET_KEY, { expiresIn: '24h' });

        // Tạo refresh token
        const refreshToken = jwt.sign({ credential_id: credential["credential_id"] }, process.env.SECRET_KEY, { expiresIn: '7d' });

        // lưu token lại
        const verifycation_data = {
            credential_id: credential_id,
            token_type: "access",
            verif_token: accessToken,
            expire_date: new Date(Date.now() + 12 * 60 * 60 * 1000)
        };

        const refreshTokenData = {
            credential_id: credential_id,
            token_type: "refresh",
            verif_token: refreshToken,
            expire_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };

        await VerificationToken.create(verifycation_data);
        await VerificationToken.create(refreshTokenData);

        return res.json({
            code: 200,
            message: "Tạo tài khoản thành công, bạn có thể đăng nhập"
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi tạo tài khoản" +error
        });
    }
}


//[POST] /admin/accounts/login
export const login = async (req: Request, res: Response) => {
    try {
        const {username, password} = req.body;

        return res.json({
            code: 200,
            message: "Đăng nhập thành công",
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi đăng nhập" +error
        });
    }
}