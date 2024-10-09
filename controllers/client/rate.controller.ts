import { Express, Request, Response } from "express";
import Cart from "../../models/cart.model";
import User from "../../models/user.model";
import CartItem from "../../models/cart_item.model";
import Product from "../../models/product.model";
import OrderItem from "../../models/order-item.model";
import Order from "../../models/order.model";
import { DATE, Op, where } from "sequelize";
import Payment from "../../models/payment.model";
import Rate from "../../models/rate.model";


//[PATCH] /rate/:productId/:rate
export const index = async (req: Request, res: Response) => {
    try {
        const {productId, rate} = req.params;

        const user = res.locals.user;

        const rateExist = await Rate.findOne({
            where: {
                product_id: parseInt(productId),
                user_id: user["user_id"]
            },
            raw: true
        });

        if(!rateExist)
        {
            await Rate.create({
                star: parseFloat(rate),
                product_id: parseInt(productId),
                user_id: user["user_id"],
            })
        }
        else
        {
            await Rate.update({
                star: parseFloat(rate),
            }, {
                where: {
                    id_rate: rateExist["id_rate"]
                }
            })
        }

        return res.json({
            code: 200,
            message: "Đánh giá sao thành công!",
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi đánh giá sao " + error
        })
    }
}