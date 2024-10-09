import { Express, Request, Response } from "express";
import Product from "../../models/product.model";
import { Op, QueryTypes } from "sequelize";
import { convertToSlug } from "../../helpers/convert-to-slug.helper";
import { paginationHelper } from "../../helpers/pagination.helper";
import User from "../../models/user.model";
import Wishlist from "../../models/wishlist.model";
import sequelize from "../../configs/database";


//[GET] /product/index.js
export const index = async (req: Request, res: Response) => {
    try {
        console.log(req.query);

        let find = {
            status: "active",
            deleted: false,
        };

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
        if (req.query["fromPrice"] && req.query["toPrice"]) {
            const fromPriceQuery = req.query["fromPrice"];
            const toPriceQuery = req.query["toPrice"];

            if (typeof fromPriceQuery === 'string' && typeof toPriceQuery === 'string') {
                let price1 = parseInt(fromPriceQuery);
                let price2 = parseInt(toPriceQuery);

                find["price_unit"] = {
                    [Op.and]: [
                        { [Op.gte]: price1 },
                        { [Op.lte]: price2 },
                    ]
                };
            }
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

        // ---- giá mới + đếm số lượng sản phẩm đã bán ---
        for (const item of products) {
            const newPrice = item["price_unit"] * (1 - item["discount"] / 100);
            item["newPrice"] = newPrice.toFixed(0);

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
                    item["rating"] = averageRating.toFixed(1);
                    return item; 
                }
                
                return null;
            });

            // Chờ tất cả các Promise hoàn thành
            const results = await Promise.all(productPromises);
            
            products = results.filter(item => item !== null);
        }

        // Sau khi đã lọc xong -> phân trang
        const countProducts = products.length;
        const objectPagination = paginationHelper(req, countProducts);

        // Áp dụng phân trang
        const paginatedProducts = products.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);

        console.log(paginatedProducts);

        return res.json({
            code: 200,
            data: paginatedProducts,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"]
        });
    } catch (error) {
        return res.json({
            code: 500,
            message: error
        })
    }
}

//[POST] /products/like/:type/:productId
export const like = async (req: Request, res: Response) => {
    try {
        const {productId} = req.params;
        const credential_id = req["credential_id"];
        const isLike = req.params["type"];

        let user = res.locals.user;

        if(!user)
        {
            user = await User.findOne({
                where: {
                    credential_id: credential_id
                },
                raw: true
            });    
        }
        
        if(isLike === "yes")
        {
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
        
        const product = await Product.findOne({
            attributes: { exclude: ['createdAt', 'updatedAt', 'deleted', 'status'] },
            where: {
                product_id: productId,
            },
            raw: true
        })

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
        })

        return res.json({
            code: 200,
            message: "Load dữ liệu chi tiết sản phẩm thành công",
            data: product,
            quantityProductSold: parseInt(countQuantitySold[0]["total_quantity"]) || 0,
            rating: parseFloat(ratingAVG[0]["rating"]) || 0
        })
    } catch (error) {
        return res.json({
            code: 400,
            message: "Load dữ liệu chi tiết sản phẩm thất bại " + error
        })
    }
}

