import { Request, Response } from "express";
import Role from "../../models/roles.model";
import { Op } from "sequelize";

//[GET] /admin/roles
export const index = async (req: Request, res: Response) => {
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

//[POST] /admin/roles/create
export const create = async (req: Request, res: Response) => {
    try {
        
        await Role.create(req.body);

        return res.json({
            code: 200,
            message: "Tạo role thành công"
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi tạo role " +error
        });
    }
}

//[GET] /admin/roles/edit/:role_id
export const edit = async (req: Request, res: Response) => {
    try {
        
        const role_id = req.params["role_id"];

        const role = await Role.findOne({
            where: {
                role_id: parseInt(role_id)
            },
            raw: true
        })

        return res.json({
            code: 200,
            data: role
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy dữ liệu role " +error
        });
    }
}

//[PATCH] /admin/roles/edit/:role_id
export const editPatch = async (req: Request, res: Response) => {
    try {
        
        const role_id = req.params["role_id"];

        await Role.update({
            ...req.body
        }, {
            where: {
                role_id: parseInt(role_id),
            }
        })
        return res.json({
            code: 200,
            message: "Cập nhật thành công"
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi cập nhật role " +error
        });
    }
}

//[PATCH] /admin/roles/permissions
export const editPermission = async (req: Request, res: Response) => {
    try {
        for (const item of req.body) {
            await Role.update({
                permissions: item["permissions"]
            }, {
                where: {
                    role_id: item["role_id"]
                }
            })
        }
        
        return res.json({
            code: 200,
            message: "Phân quyền thành công"
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi phân quyền " +error
        });
    }
}