import { Request, Response } from "express";
import User from "../../models/user.model";
import { where } from "sequelize";
import Address from "../../models/address.model";



// [GET] /account
export const index = async (req: Request, res: Response) => {
    try {
        let user = res.locals.user;

        const addresses = await Address.findAll({
            where: {
                user_id: user["user_id"],
            },
            raw: true
        })

        user["addresses"] = addresses
    
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

        console.log()

        console.log(req.body);

        await User.update({
            image_url: req.body.image_url as string,
            first_name: req.body.firstName as string,
            last_name: req.body.lastName as string,
            phone: req.body.phone as string
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
            message: "Lỗi cập nhật thông tin"
        })
    }
}