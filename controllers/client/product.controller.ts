import { Express, Request, Response } from "express";
import Product from "../../models/product.model";
import jwt from "jsonwebtoken";
import store from "store";
import { Op, QueryTypes } from "sequelize";
import { convertToSlug } from "../../helpers/convert-to-slug.helper";
import { paginationHelper } from "../../helpers/pagination.helper";
import User from "../../models/user.model";
import Wishlist from "../../models/wishlist.model";
import sequelize from "../../configs/database";
import Comment from "../../models/comment.model";
import Cart from "../../models/cart.model";
import CartItem from "../../models/cart_item.model";



//[GET] /product/index.js
export const index = async (req: Request, res: Response) => {
    try {
        // console.log(req.query);

        let find = {
            status: "active",
            deleted: false,
        };

        const category_id = parseInt(req.query["category_id"] as string);
        if(category_id)
        {
            const category_ids = await sequelize.query(`
                WITH RECURSIVE category_hierarchy AS (
                SELECT category_id, parent_category_id, category_title
                FROM categories
                WHERE category_id = ${category_id}  -- danh mục gốc mà bạn click vào

                UNION ALL

                SELECT c.category_id, c.parent_category_id, c.category_title
                FROM categories c
                INNER JOIN category_hierarchy ch ON c.parent_category_id = ch.category_id
            )
            SELECT category_id from category_hierarchy
            `, {
                raw: true,
                type: QueryTypes.SELECT
            })
            //          category_ids = [ { category_id: 11 }, { category_id: 22 } ]
            const just_category_ids = [];
            for (const item of category_ids) {
                just_category_ids.push(item["category_id"])
            };
            console.log(just_category_ids);
            find["category_id"] = {
                [Op.in]: just_category_ids
            };
        } 


        // sort 
        const sort: [string, string][] = [];

        if (req.query["sortKey"] && req.query["sortValue"]) {
            const sortKey = req.query["sortKey"] as string;
            const sortValue = req.query["sortValue"];

            if (typeof sortValue === 'string') {
                const formattedSortValue = sortValue.toUpperCase();
                sort.push([sortKey, formattedSortValue]);
            } else {
                console.error('sortValue is not a string');
            }
        }

        // filter price
        const fromPrice = parseInt(req.query["fromPrice"] as string) || 0;
        const toPrice = parseInt(req.query["toPrice"] as string) || 0;
        if (fromPrice && toPrice) {
            
            find["price_unit"] = {
                [Op.and]: [
                    { [Op.gte]: fromPrice },
                    { [Op.lte]: toPrice },
                ]
            };
        }

        // search with title
        if (req.query["searchKey"]) {
            const titleFromSearh = req.query["searchKey"] as string;
            if (typeof titleFromSearh === "string") {
                let title = convertToSlug(titleFromSearh.toLowerCase());
                find["slug"] = { [Op.like]: `%${title}%` };
            }
        }

        // Lấy tất cả sản phẩm trước khi phân trang
        let products = await Product.findAll({
            where: find,
            attributes: { exclude: ['createdAt', 'updatedAt', 'deleted', 'status'] },
            order: sort,
            raw: true,
        });

        // console.log("----------------------------------------")

        let user = null;

        let accessToken = req.headers["authorization"];



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
        

        // ---- giá mới + đếm số lượng sản phẩm đã bán + rating ---
        for (const item of products) {
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

        // rate
        let rate = req.query["rate"] as string;
        if (rate) {
            const rateValue = parseFloat(rate);
    
            // Tạo một mảng các Promise
            const productPromises = products.map(async (item) => {
                const avgRating = await sequelize.query(`
                    SELECT AVG(star) AS average_rating
                    FROM rate
                    WHERE product_id = ${item["product_id"]}
                `, {
                    type: QueryTypes.SELECT,
                    raw: true
                });

                const averageRating = parseFloat(avgRating[0]["average_rating"]) || 0;
                
                if (averageRating >= rateValue) {
                    item["rating"] = parseFloat(averageRating.toFixed(1));
                    return item; 
                }
                
                return null;
            });

            // Chờ tất cả các Promise hoàn thành
            const results = await Promise.all(productPromises);
            
            products = results.filter(item => item !== null);
        }

       

        // AND p.slug LIKE '%${searchKey}%'
        // ORDER BY ${sortKey} ${sortValue}
        // LIMIT ${limit} OFFSET ${offset};

        // Sau khi đã lọc xong -> phân trang
        const countProducts = products.length;
        const objectPagination = paginationHelper(req, countProducts);

        // Áp dụng phân trang
        const paginatedProducts = products.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);

        // console.log(paginatedProducts);

        return res.json({
            code: 200,
            data: paginatedProducts,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"],
            fromPrice: fromPrice,
            toPrice: toPrice
        });
    } catch (error) {
        return res.json({
            code: 500,
            message: error
        })
    }
}

//[POST] /products/like/:productId
export const like = async (req: Request, res: Response) => {
    try {
        const {productId} = req.params;

        let user = res.locals.user;
        
        const existRecord = await Wishlist.findOne({
            where:{
                user_id: user["user_id"],
                product_id: parseInt(productId)
            },
            raw: true
        });

        if(!existRecord)
        {
            await Wishlist.create({
                user_id: user["user_id"],
                product_id: parseInt(productId),
                like_date: new Date(Date.now())
            })
        }
        else
        {
            await Wishlist.destroy({
                where: {
                    user_id: user["user_id"],
                    product_id: parseInt(productId)
                }
            })
        }

        return res.json({
            code: 200,
            message: "Thành công!"
        })
    } catch (error) {
        return res.json({
            code: 400,
            message: "Thất bại " + error
        })
    }
}

//[GET] /products/:productId
export const detail = async (req: Request, res: Response) => {
    try {
        const {productId} = req.params;

        console.log("----------------------------------------")
        
        let accessToken = req.headers["authorization"];

        console.log("token product detail: " + accessToken)
        
        let like = false;

        let isCommented = false;

        const listComment = await Comment.findAll({
            where: {
                product_id: parseInt(productId),
                deleted: false
            },
            order: [
                ['createdAt', 'DESC']
            ],
            limit: 4,
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

        if(accessToken && accessToken.trim() !== "Bearer")
        {
            accessToken = accessToken.split(" ")[1];
            const decoded = jwt.decode(accessToken);
            const { credential_id } = decoded;

            const user = await sequelize.query(`
                select users.user_id
                FROM users JOIN credentials on users.credential_id = credentials.credential_id
                WHERE credentials.credential_id = ${credential_id}
            `, {
                raw: true,
                type: QueryTypes.SELECT
            })

            const record = await sequelize.query(`
                select * 
                FROM wishlist JOIN users on wishlist.user_id = users.user_id and wishlist.user_id = ${user[0]["user_id"]}
                JOIN products ON products.product_id = wishlist.product_id and wishlist.product_id = ${productId}
            `, {
                raw: true,
                type: QueryTypes.SELECT
            })

            if(record)
            {
                like = true
            }

        
            // ----- comment----
            if(user)
            {
                const existUserComment = listComment.find(item => item["user_id"] === user[0]["user_id"]);
                if(existUserComment)
                {
                    isCommented = true;
                }
            }

        };
        
        const product = await Product.findOne({
            attributes: { exclude: ['createdAt', 'updatedAt', 'deleted', 'status'] },
            where: {
                product_id: productId,
            },
            raw: true
        });

        product["newPrice"] = Math.floor((product["price_unit"] * (1 - (product["discount"] || 0)/100)));

        const countQuantitySold = await sequelize.query(`
            SELECT SUM(oi.ordered_quantity) AS total_quantity
            FROM order_items oi
            JOIN payments pm ON oi.order_id = pm.order_id
            WHERE oi.product_id = ${product["product_id"]}
            AND pm.payment_status = 'Đã giao';
        `, {
            raw: true,
            type: QueryTypes.SELECT
        })

        //  AND pm.is_payed = 1

        const ratingAVG = await sequelize.query(`
            SELECT AVG(rate.star) as rating 
            FROM rate
            WHERE rate.product_id = ${product["product_id"]}
        `, {
            raw: true,
            type: QueryTypes.SELECT
        });

        product["comment"] = listComment;

        return res.json({
            code: 200,
            message: "Load dữ liệu chi tiết sản phẩm thành công",
            data: product,
            quantityProductSold: parseInt(countQuantitySold[0]["total_quantity"]) || 0,
            rating: parseFloat(ratingAVG[0]["rating"]) || 0,
            like: like,
            commented: isCommented
        })
    } catch (error) {
        return res.json({
            code: 400,
            message: "Load dữ liệu chi tiết sản phẩm thất bại " + error
        })
    }
}

//[GET] /products/list/top-sold"
export const topSold = async (req: Request, res: Response) => {
    try {
        
        const data = await sequelize.query(`
            SELECT order_items.product_id, SUM(order_items.ordered_quantity) as total_quantity_sold from 
            payments JOIN order_items on payments.order_id = order_items.order_id and payments.payment_status='Đã giao'
            JOIN products on products.product_id = order_items.product_id
            GROUP BY order_items.product_id
            ORDER BY total_quantity_sold DESC
            LIMIT 20            
        `, {
            raw: true,
            type: QueryTypes.SELECT
        });

        console.log(data);

        // [
        //     { product_id: 8, quantity_count: '5' },
        //     { product_id: 2, quantity_count: '3' },
        //     { product_id: 9, quantity_count: '3' },
        //     { product_id: 3, quantity_count: '1' },
        //     { product_id: 1, quantity_count: '1' }
        // ]
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

        for (const item of data) {
            const productId = item["product_id"];
            item["total_quantity_sold"] = parseInt(item["total_quantity_sold"])
            const infoProduct = await Product.findOne({
                where:{
                    product_id: productId,
                },
                attributes: {exclude:['updatedAt', 'createdAt', 'deleted', 'product_id']},
                raw: true
            });
            item["infoProduct"] = infoProduct

            // rate
            const ratingAVG = await sequelize.query(`
                SELECT AVG(rate.star) as rating 
                FROM rate
                WHERE rate.product_id = ${productId}
            `, {
                raw: true,
                type: QueryTypes.SELECT
            });
            item["rating"] = parseFloat(ratingAVG[0]["rating"]) || 0;

            //like
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
            message: "Load dữ liệu chi tiết sản phẩm thành công",
            data: data
        })
    } catch (error) {
        return res.json({
            code: 400,
            message: "Load dữ liệu chi tiết sản phẩm thất bại " + error
        })
    }
}

//[GET] /products/wishlist
export const wishlist = async (req: Request, res: Response) => {
    try {
        let user = res.locals.user;
        
        const wishlist = await Wishlist.findAll({
            where: {
                user_id: user["user_id"]
            },
            raw: true
        });

        let ids = wishlist.map(item => {return item["product_id"]});

        console.log(ids);

        console.log(wishlist);

        const dataProductsWishlist = await Product.findAll({
            where: {
                product_id: {
                    [Op.in]: ids,
                }
            },
            attributes:{exclude: ["createdAt", "updatedAt", "deleted",]},
            raw: true
        })

        const objectPagination = paginationHelper(req, dataProductsWishlist.length);

        // Áp dụng phân trang
        const paginatedProductsWishlist = dataProductsWishlist.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);


        return res.json({
            code: 200,
            message: "Thành công!",
            data: paginatedProductsWishlist,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"],
        })
    } catch (error) {
        return res.json({
            code: 400,
            message: "Thất bại " + error
        })
    }
}
//[DELETE] /products/delete/favorite/:productId
export const deleteFavoriteProduct = async (req: Request, res: Response) => {
    try {
        let user = res.locals.user;
        const productId = req.params.productId;

        await Wishlist.destroy({
            where: {
                product_id: parseInt(productId),
                user_id: user["user_id"]
            }
        })
        
        return res.json({
            code: 200,
            message: "Xóa sản phẩm yêu thích thành công!",
        })
    } catch (error) {
        return res.json({
            code: 400,
            message: "Thất bại " + error
        })
    }
}

//[DELETE] /products/wishlist/add-to-cart
export const addToCartFromWishlist = async (req: Request, res: Response) => {
    try {
        let user = res.locals.user;
        
        console.log(req.body);

        const ids = req.body;

        const cart = await Cart.findOne({
            where: {
                user_id: user["user_id"],
            },
            raw: true
        });

        for (const id of ids) {
            const exitsItem = await CartItem.findOne({
                where: {
                    cart_id: cart["cart_id"],
                    product_id: id
                }
            });
            if(exitsItem)
            {
                await CartItem.update({
                    ordered_quantity: exitsItem["ordered_quantity"] + 1
                }, {
                    where: {
                        cart_item_id: exitsItem["cart_item_id"]
                    }
                })
            }
            else
            {
                await CartItem.create({
                    cart_id: cart["cart_id"],
                    product_id: id,
                    ordered_quantity: 1
                });
            }
            
            await Wishlist.destroy({
                where: {
                    product_id: id
                }
            })
        }
        
        return res.json({
            code: 200,
            message: "Thêm sản phẩm yêu thích vào giỏ hàng thành công!",
        })
    } catch (error) {
        return res.json({
            code: 400,
            message: "Thất bại " + error
        })
    }
}