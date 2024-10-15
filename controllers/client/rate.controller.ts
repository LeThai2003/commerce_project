import { Express, Request, Response } from "express";
import Cart from "../../models/cart.model";
import User from "../../models/user.model";
import CartItem from "../../models/cart_item.model";
import Product from "../../models/product.model";
import OrderItem from "../../models/order-item.model";
import Order from "../../models/order.model";
import { DATE, Op, QueryTypes, where } from "sequelize";
import Payment from "../../models/payment.model";
import Rate from "../../models/rate.model";
import sequelize from "../../configs/database";


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

//[GET] /rate/top-rate
export const topRate = async (req: Request, res: Response) => {
    try {

        const dataTopRating = await sequelize.query(`
            SELECT product_id, AVG(star) as rating
            FROM rate
            GROUP BY product_id
            ORDER BY rating DESC
            LIMIT 6    
        `, {
            raw: true,
            type: QueryTypes.SELECT,
        });

        console.log(dataTopRating);

        let ids = []

        for (const item of dataTopRating) {
            item["rating"] = parseFloat(item["rating"]);
            ids.push(item["product_id"]);
        }

        const products = await Product.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt', 'deleted'] },
            where:{
                product_id: {
                    [Op.in]: ids
                }
            },
            raw: true
        });

        console.log(products)

        let newProducts = [];

        for (const item of dataTopRating) {
            newProducts.push({
                ...item,
                ...products.find(item => item["product_id"] === item["product_id"])
            })
        }

        return res.json({
            code: 200,
            message: "Lấy danh sách top rate thành công",
            data: newProducts
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi lấy danh sách top-rate " + error
        })
    }
}