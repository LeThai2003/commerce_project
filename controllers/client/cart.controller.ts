import { Express, Request, Response } from "express";
import Cart from "../../models/cart.model";
import User from "../../models/user.model";
import CartItem from "../../models/cart_item.model";
import Product from "../../models/product.model";
import { where } from "sequelize";


// [GET] /cart
export const index = async (req: Request, res: Response) => {
    try {
        // tìm giỏ hàng
        const user = res.locals.user;

        let cart = await Cart.findOne({
            where: {
                user_id: user["user_id"]
            },
            raw: true,
        });

        if(!cart)
        {
            return res.json({
                code: 200,
                message: "Giỏ hàng không tồn tại",
                data: [],
                totalPrice: 0,
            })
        };

        const cartItems = await CartItem.findAll({
            where: {
                cart_id: cart["cart_id"],
            },
            raw: true,
        });

        if(cartItems.length === 0)
        {
            return res.json({
                code: 200,
                message: "Giỏ hàng tróng!",
                data: [],
                totalPrice: 0,
            })
        }

        let totalPrice : number = 0;

        
        for (const item of cartItems) {
            const infoProduct = await Product.findOne({
                where: {
                    product_id: item["product_id"],
                },
                raw: true,
            });

            item["infoProduct"] = infoProduct;

            const newPrice = Math.ceil(infoProduct["price_unit"] * ( 1 - infoProduct["discount"] / 100));
            const totalPriceItem = newPrice * item["ordered_quantity"];
            totalPrice += totalPriceItem;

            item["newPrice"] = newPrice;
            item["totalPriceItem"] = totalPriceItem;
        }

        return res.json({
            code: 200,
            cart_id: cart["cart_id"],
            data: cartItems,
            totalPrice: totalPrice,
        })
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy sản phẩm giỏ hàng" + error
        })
    }
}


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

        // console.log(cartItem);

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
                    message: `Số lượng đặt hàng không được vượt quá số lượng tồn kho`
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
        
        return res.json({
            code: 200,
            message: "Thêm sản phẩm vào giỏ hàng thành công!",
            cartItem: cartItem,
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi thêm sản phẩm vào giỏ hàng" +error
        })
    }
}


//[pOST] /cart/update-quantity
export const updateQuantity = async (req: Request, res: Response) => {
    try {
        const {cart_id, product_id, ordered_quantity} = req.body;

        console.log(cart_id)
        console.log(product_id)
        console.log(ordered_quantity)

        const cartItem = await CartItem.findOne({
            where:{
                cart_id: cart_id,
                product_id: product_id,
            },
            raw: true,
        });

        if((cartItem["ordered_quantity"] === 1) && (ordered_quantity === -1))
        {
            return res.json({
                code: 400,
                message: "Bạn muốn xóa sản phẩm ?"
            });
        }
        else
        {
            await CartItem.update({
                ordered_quantity : ordered_quantity +  cartItem["ordered_quantity"]
            }, {
                where: {
                    cart_item_id: cartItem["cart_item_id"]
                }
            })
        }

        return res.json({
            code: 200,
            message: "Cập nhật số lượng sản phẩm trong giỏ hàng thành công"
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi cập nhật số lượng sản phẩm trong giỏ hàng"
        })
    }
}

//[pOST] /cart/deleteItem/:cart_item_id
export const deleteItem = async (req: Request, res: Response) => {
    try {
        const {cart_item_id} = req.params;

        console.log(cart_item_id)

        await CartItem.destroy({
            where:{
                cart_item_id: parseInt(cart_item_id),
            },
        });

        return res.json({
            code: 200,
            message: "Xóa sản phẩm trong giỏ hàng thành công"
        })
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi xóa sản phẩm trong giỏ hàng"
        })
    }
}