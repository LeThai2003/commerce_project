import { Express, Request, Response } from "express";
import Cart from "../../models/cart.model";
import User from "../../models/user.model";
import CartItem from "../../models/cart_item.model";
import Product from "../../models/product.model";



//[pOST] /cart/add
export const add = async (req: Request, res: Response) => {
    try {
        let {product_id, ordered_quantity} = req.body;

        console.log(product_id);
        console.log(ordered_quantity);

        // tìm giỏ hàng
        const credential_id = req["credential_id"];

        const user = await User.findOne({
            where:{
                credential_id: credential_id,
            },
            raw: true,
        });

        let cart = await Cart.findOne({
            where: {
                user_id: user["user_id"]
            },
            raw: true,
        });

        if(!cart)
        {
            cart = await Cart.create({
                user_id: user["user_id"]
            })
        };

        // Thêm sản phẩm vào giỏ hàng
        let cartItem = await CartItem.findOne({
            where: {
                cart_id: cart["cart_id"],
                product_id: parseInt(product_id)
            },
            raw: true,
        });

        console.log(cartItem);

        const product = await Product.findOne({
            where: {
                product_id: parseInt(product_id)
            },
            raw: true,
        });

        if(cartItem)
        {
            if (cartItem["ordered_quantity"] + ordered_quantity > product["quantity"]) {
                return res.json({
                    code: 400,
                    message: `Số lượng đặt hàng không được vượt quá ${product["quantity"]}`
                });
            };
            await CartItem.update({
                ordered_quantity: cartItem["ordered_quantity"] + ordered_quantity
            }, {
                where:{
                    cart_id: cart["cart_id"],
                    product_id: cartItem["product_id"]
                }
            })
        }
        else
        {
            await CartItem.create({
                cart_id: cart["cart_id"],
                product_id: product_id,
                ordered_quantity: ordered_quantity
            })
        }
        
        res.json({
            code: 200,
            message: "Thêm sản phẩm vào giỏ hàng thành công!",
            cartItem: cartItem,
        })
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi thêm sản phẩm vào giỏ hàng"
        })
    }
}