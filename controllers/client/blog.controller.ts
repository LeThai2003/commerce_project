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
import Blog from "../../models/blog.model";
import { paginationHelper } from "../../helpers/pagination.helper";


//[POST] /comment/:productId
export const postComment = async (req: Request, res: Response) => {
    try {
        const {productId} = req.params;

        const user = res.locals.user;

        console.log(req.body);

        await Comment.create({
            product_id: productId,
            user_id: user["user_id"],
            content: req.body.content,
            star: parseFloat(req.body.rate),
            image_url: JSON.stringify(req.body.image_url)
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

//[GET] /blogs
export const listBlog = async (req: Request, res: Response) => {
    try {

        const blogsList = await Blog.findAll({
            where: {
                deleted: false
            },
            attributes: {exclude: ['deleted', 'updatedAt']},
            raw: true
       })

       console.log(blogsList);

        const objectPagination = paginationHelper(req, blogsList.length);

        const paginatedBlogs = blogsList.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);
        

        return res.json({
            code: 200,
            message: "Lấy danh sách blogs thành công",
            data: paginatedBlogs,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"]
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi lấy danh sách blogs " + error
        })
    }
}