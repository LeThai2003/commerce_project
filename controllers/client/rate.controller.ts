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
import jwt from "jsonwebtoken";
import Wishlist from "../../models/wishlist.model";


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

//[GET] /rate/top-rate/:limit
export const topRate = async (req: Request, res: Response) => {
    try {
        const limit = req.params.limit;
        console.log(limit);
        const dataTopRating = await sequelize.query(`
            SELECT product_id, AVG(star) as rating
            FROM rate
            GROUP BY product_id
            ORDER BY rating DESC
            LIMIT ${limit} 
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
        

        let newProducts = [];

        for (const item of dataTopRating) {
            newProducts.push({
                ...item,
                ...products.find(infoProduct => infoProduct["product_id"] === item["product_id"])
            })
        }

        let accessToken = req.headers["authorization"];

        let user = null;

        if(accessToken && accessToken.trim() !== "Bearer")
        {
            accessToken = accessToken.split(" ")[1];
            const decoded = jwt.decode(accessToken);
            const { credential_id } = decoded;

            user = await User.findOne({
                where: {
                    credential_id: credential_id
                },
                raw: true
            })
        };

        for (const item of newProducts) {
            const newPrice = item["price_unit"] * (1 - (item["discount"] || 0) / 100);
            item["newPrice"] = newPrice;

            const countQuantitySale = await sequelize.query(`
                SELECT SUM(order_items.ordered_quantity) AS total_quantity_sold
                FROM orders
                JOIN payments ON orders.order_id = payments.order_id
                JOIN order_items ON order_items.order_id = orders.order_id
                WHERE payments.payment_status = 'Đã giao'
                AND order_items.product_id = ${item["product_id"]};
            `, {
                type: QueryTypes.SELECT,
                raw: true
            });

            item["total_quantity_sold"] = parseInt(countQuantitySale[0]["total_quantity_sold"]) || 0;

            const ratingAVG = await sequelize.query(`
                SELECT AVG(rate.star) as rating 
                FROM rate
                WHERE rate.product_id = ${item["product_id"]}
            `, {
                raw: true,
                type: QueryTypes.SELECT
            });

            // console.log(parseFloat(ratingAVG[0]["rating"]))

            item["rating"] = parseFloat(ratingAVG[0]["rating"]) || 0;

            if(user)
            {
                const existRecodeProductLike = await Wishlist.findOne({
                    where: {
                        product_id: item["product_id"],
                        user_id: user["user_id"] 
                    }
                });
                if(existRecodeProductLike)
                {
                    item["like"] = true;
                }
                else
                {
                    item["like"] = false;
                }
            }
            else
            {
                item["like"] = false;
            }
        }

        return res.json({
            code: 200,
            message: "Lấy danh sách topRating thành công",
            data: newProducts
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi lấy danh sách topRating " + error
        })
    }
}
