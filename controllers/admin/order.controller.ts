import { Express, Request, Response } from "express";
import Category from "../../models/category.model";
import { createTreeHelper } from "../../helpers/create-tree.helper";
import { paginationHelper } from "../../helpers/pagination.helper";
import sequelize from "../../configs/database";
import { Op, QueryTypes } from "sequelize";
import Blog from "../../models/blog.model";
import Contact from "../../models/contact.model";
import Order from "../../models/order.model";
import Payment from "../../models/payment.model";
import Address from "../../models/address.model";
import PaymentStatus from "../../models/paymentStatus.model";
import Product from "../../models/product.model";
import OrderItem from "../../models/order-item.model";
import Cart from "../../models/cart.model";
import User from "../../models/user.model";



//[GET] admin/orders
export const index = async (req: Request, res: Response) => {
    try {

        const listOrder = await Order.findAll({
            where: {
                deleted: false
            },
            raw: true
        })

        for (const item of listOrder) {
            const infoPayment = await Payment.findOne({
                where: {
                    order_id: item["order_id"]
                },
                raw: true
            });

            const paymentStatus = await PaymentStatus.findOne({
                where: {
                    id: infoPayment["payment_status"]
                },
                raw: true
            });

            console.log(paymentStatus)

            infoPayment["payment_status"] = paymentStatus["status"];
            infoPayment["payment_status_id"] = paymentStatus["id"];

            console.log(infoPayment);

            item["infoPayment"] = infoPayment

            const infoAddress = await Address.findOne({
                where:{
                    address_id: item["address"]
                },
                raw: true
            });

            console.log(infoAddress);

            item["address"] = infoAddress["address_name"];


            const cart = await Cart.findOne({
                where: {
                    cart_id: item["cart_id"]
                },
                raw: true
            });

            const user = await User.findOne({
                where: {
                    user_id: cart["user_id"],
                },
                attributes:{exclude: ['deleted', 'createdAt', 'updatedAt']},
                raw: true
            });
            item["infoUser"] = user;
        }

        const objectPagination = paginationHelper(req, listOrder.length);

        const paginatedOrders = listOrder.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);
        

        return res.json({
            code: 200,
            message: "Lấy danh sách contacts thành công",
            data: paginatedOrders,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"]
        })
        
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy danh sách contacts " + error
        })
    }
}

//[GET] admin/orders/status-payment
export const statusPayment = async (req: Request, res: Response) => {
    try {
        
        const listStatus = await PaymentStatus.findAll({raw: true});

        return res.json({
            code: 200,
            message: "Lấy danh sách trạng thái thành công",
            data: listStatus
        })
        
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy danh sách trạng thái " + error
        })
    }
}


//[post] admin/orders/status-change/order-id/:status-id
export const changeStatus = async (req: Request, res: Response) => {
    try {
        
        const statusId= parseInt(req.params["statusId"] as string);
        const orderId = parseInt(req.params["orderId"] as string);

        if(statusId == 8 || statusId == 9)
        {
            const orderItems = await OrderItem.findAll({
                where: {
                    order_id: orderId
                },
                raw: true
            });

            for (const item of orderItems) {

                const infoProduct = await Product.findOne({
                    where: {
                        product_id : item["product_id"]
                    },
                    raw: true
                })

                await Product.increment("quantity", {
                    by: item["ordered_quantity"],
                    where: {
                        product_id: infoProduct["product_id"],
                    }
                })

                await OrderItem.destroy({
                    where: {
                        [Op.and]: [{ order_id: orderId }, { product_id: infoProduct["product_id"] }],
                    }
                })

                await Payment.update({
                    payment_status: statusId
                }, {
                    where: {
                        order_id: orderId
                    }
                })
            }

            
        }
        else
        {
            await Payment.update({
                payment_status: statusId
            }, {
                where: {
                    order_id: orderId
                }
            })
        }

        return res.json({
            code: 200,
            message: "Thay đổi trạng thái thành công",
        })
        
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi thay đổi trạng thái " + error
        })
    }
}


