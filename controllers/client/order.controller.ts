import { Express, Request, Response } from "express";
import Cart from "../../models/cart.model";
import User from "../../models/user.model";
import CartItem from "../../models/cart_item.model";
import Product from "../../models/product.model";
import OrderItem from "../../models/order-item.model";
import Order from "../../models/order.model";
import { DATE, where } from "sequelize";



//[pOST] /cart/add
export const index = async (req: Request, res: Response) => {
    try {
        let {fullName, phone, address, note} = req.body["infoCustomer"];

        const credential_id = req["credential_id"];
        
        const user = await User.findOne({
            where: {
                credential_id: credential_id,
            },
            raw: true,
        });

        const cart = await Cart.findOne({
            where: {
                user_id: user["user_id"],
            },
            raw: true,
        });

        if(!cart)
        {
            res.json({
                code: 403,
                message: "Giỏ hàng không tồn tại!"
            })
        }

        const cartItems = await CartItem.findAll({
            where: {
                cart_id: cart["cart_id"],
            },
            raw: true,
        });

        // console.log(orderItems);

        if(cartItems.length === 0)
        {
            res.json({
                code: 40,
                message: "Giỏ hàng tróng!"
            })
        }
        
        let totalPrice : number = 0;

        // Lưu orders
        const orders = await Order.create({
            cart_id: cart["cart_id"],
            order_date: new Date(),
            order_desc: note,
            order_fee: totalPrice,
            fullName: fullName,
            phone: phone,
            address: address
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

        // console.log(totalPrice);

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
                cart_id: cart["cart_id"],
            }
        })


        res.json({
            code: 200,
            message: "Đặt hàng thành công!",
        })
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi đặt hàng"
        })
    }
}