import { Express, Request, Response } from "express";
import Cart from "../../models/cart.model";
import User from "../../models/user.model";
import CartItem from "../../models/cart_item.model";
import Product from "../../models/product.model";
import OrderItem from "../../models/order-item.model";
import Order from "../../models/order.model";
import { DATE, Op, where } from "sequelize";
import Payment from "../../models/payment.model";


//[POST] /orders
export const index = async (req: Request, res: Response) => {
    try {
        let {note, address, phone} = req.body["infoCustomer"];
        const method_payment = req.body["method_payment"];

        const user = res.locals.user;

        const cart = await Cart.findOne({
            where: {
                user_id: user["user_id"]
            },
            raw: true,
        });

        if(!cart)
        {
            return res.json({
                code: 404,
                message: "Giỏ hàng không tồn tại!"
            })
        }

        const cartItems = await CartItem.findAll({
            where: {
                cart_id: cart["cart_id"]
            },
            raw: true,
        });

        if(cartItems.length === 0)
        {
            return res.json({
                code: 200,
                message: "Giỏ hàng trống!"
            })
        }
        
        let totalPrice : number = 0;

        // Lưu orders
        const orders = await Order.create({
            cart_id: cart["cart_id"],
            order_date: new Date(),
            order_desc: note,
            order_fee: totalPrice,
            address: address,
            phone: phone
        });

        for (const item of cartItems) {
            const infoProduct = await Product.findOne({
                where: {
                    product_id: item["product_id"],
                },
                raw: true,
            });

            const newPrice = Math.ceil(infoProduct["price_unit"] * ( 1 - infoProduct["discount"] / 100));
            const totalPriceItem = newPrice * item["ordered_quantity"];
            totalPrice += totalPriceItem;

            await OrderItem.create({
                order_id: orders.dataValues["order_id"],
                product_id: infoProduct["product_id"],
                ordered_quantity: item["ordered_quantity"],
                price_unit: infoProduct["price_unit"],
                discount: infoProduct["discount"]
            });

            await Product.decrement("quantity", {
                by: item["ordered_quantity"],
                where: {
                    product_id: infoProduct["product_id"],
                }
            })
        }

        await Order.update({
            order_fee: totalPrice,
        },{
            where:{
                order_id: orders.dataValues["order_id"]
            }
        });

        // xóa mục cartItem
        await CartItem.destroy({
            where:{
                cart_id: cart["cart_id"]
            }
        })

        if(method_payment == 1)
        {
            // payment
            await Payment.create({
                order_id: orders.dataValues["order_id"],
                is_payed: 0, // giả sử mặc định là chưa trả
                payment_status: "Đang xử lý", // pending
            });
        }
        else
        {
            // method_pament = momo
        }

        return res.json({
            code: 200,
            message: "Đặt hàng thành công!",
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi đặt hàng"
        })
    }
}