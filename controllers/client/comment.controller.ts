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
import Comment from "../../models/comment.model";
import jwt from "jsonwebtoken";


//[POST] /comment/:productId
export const postComment = async (req: Request, res: Response) => {
    try {
        const {productId} = req.params;

        const user = res.locals.user;

        console.log(req.body);

        await Comment.create({
            product_id: parseInt(productId),
            user_id: user["user_id"],
            content: req.body.content,
            star: parseFloat(req.body.rate),
            image_url: req.body.image_url
        })

        await Rate.create({
            star: parseFloat(req.body.rate),
            product_id: parseInt(productId),
            user_id: user["user_id"],
        })

        return res.json({
            code: 200,
            message: "Comment successfully!",
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi post comment " + error
        })
    }
}

//[GET] /comment/:productId
export const listComment = async (req: Request, res: Response) => {
    try {

        const productId = req.params.productId;

        const user = res.locals.user;

        let isCommented = false;

        const listComment = await Comment.findAll({
            where: {
                product_id: parseInt(productId),
                deleted: false
            },
            raw: true
        });

        for (const comment of listComment) {
            const infoUser = await User.findOne({
                where: {
                    user_id: comment["user_id"],
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'deleted'], 
                }
            });

            comment["infoUser"] = infoUser
        }

        let accessToken = req.headers.authorization;
        if(accessToken && accessToken.trim() != "Bearer")
        {
            const decoded = jwt.decode(accessToken.split(" ")[1]);
            const { credential_id } = decoded;

            const user = await User.findOne({
                where: {
                    credential_id: credential_id, 
                },
                raw: true
            })

            if(user)
            {
                const existUserComment = listComment.find(item => item["user_id"] === user["user_id"]);
                if(existUserComment)
                {
                    isCommented = true;
                }
            }
        }

        return res.json({
            code: 200,
            message: "Lấy danh sách comment thành công",
            data: listComment,
            commented: isCommented
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi lấy danh sách comment " + error
        })
    }
}