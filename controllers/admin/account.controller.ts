import { Request, Response } from "express";
import Role from "../../models/roles.model";

//[GET] /admin/roles
export const index = async (req: Request, res: Response) => {
    try {
        const roles = await Role.findAll({
            where:{
                deleted: false,
            },
            raw: true
        })

        return res.json({
            code: 200,
            message: "Lấy danh sách roles",
            data: roles
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy danh sách roles" +error
        });
    }
}