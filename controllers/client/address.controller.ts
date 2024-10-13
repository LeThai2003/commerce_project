import { Express, Request, Response } from "express";
import Address from "../../models/address.model";


//[GET] /address
export const index = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;

        const addresses = await Address.findAll({
            where: {
                user_id: user["user_id"],
            },
            raw: true
        })
        
        return res.json({
            code: 200,
            data: addresses
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi lấy địa chỉ " + error
        })
    }
}

//[POST] /address/add
export const addAddress = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;

        const address_name = req.body["address_name"] as string;

        if(!address_name.trim())
        {
            return({
                code: 400,
                message: "Không được để trống địa chỉ"
            });
        }
        
        const isUserExist = await Address.findOne({
            where: {
                user_id: user["user_id"]
            },
            raw: true
        });

        if(isUserExist)
        {
            await Address.create({
                address_name: address_name,
                user_id: user["user_id"],
                default_address: false,
            });
        }
        else
        {
            await Address.create({
                address_name: address_name,
                user_id: user["user_id"],
                default_address: true,
            });
        }
        
        const addresses = await Address.findAll({
            where: {
                user_id: user["user_id"],
            },
            raw: true
        })

        return res.json({
            code: 200,
            message: "Thêm thành công",
            data: addresses
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi đánh giá sao " + error
        })
    }
}

//[PATCH] /address/add
export const setDefaultAddess = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;

        const address_id = parseInt(req.params["address_id"] as string);

        const addressExist = await Address.findOne({
            where: {
                address_id: address_id
            },
            raw: true
        });

        if(!addressExist)
        {
            return res.json({
                code: 404,
                message: "Không tồn tại id"
            })
        }

        await Address.update({
            default_address: 0
        }, {
            where: {
                user_id: user["user_id"]
            }
        });

        await Address.update({
            default_address: 1
        }, {
            where: {
                address_id: address_id 
            }
        });

        const addresses = await Address.findAll({
            where: {
                user_id: user["user_id"],
            },
            raw: true
        })
        
        return res.json({
            code: 200,
            message: "Cập nhật địa chỉ mặc định thành công",
            data: addresses
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi đánh giá sao " + error
        })
    }
}