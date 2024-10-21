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
import Contact from "../../models/contact.model";


//[POST] /contacts
export const postContact = async (req: Request, res: Response) => {
    try {
        console.log(req.body);

        await Contact.create({
            fullName: req.body.fullName,
            email: req.body.email,
            title: req.body.title,
            content: req.body.content
        })

        return res.json({
            code: 200,
            message: "Post a contact successfully!",
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi post contact " + error
        })
    }
}

