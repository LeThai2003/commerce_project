import { Request, Response } from "express";
import User from "../../models/user.model";
import { where } from "sequelize";



// [GET] /account
export const index = async (req: Request, res: Response) => {
    try {
        let user = res.locals.user;
    
        return res.json({
            code: 200,
            data: user
        })
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi trang tài khoản"
        })
    }
}

// [PATCH] /account/edit
export const edit = async (req: Request, res: Response) => {
    try {
        let user = res.locals.user;

        await User.update({
            ...req.body
        }, {
            where:{
                user_id: user["user_id"],
            }
        });

        user = await User.findOne({
            where: {
                user_id: user["user_id"]
            },
            raw: true
        });

        return res.json({
            code: 200,
            data: user
        })
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi trang tài khoản"
        })
    }
}