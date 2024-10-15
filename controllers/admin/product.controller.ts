import { Express, Request, Response } from "express";
import Category from "../../models/category.model";
import { createTreeHelper } from "../../helpers/create-tree.helper";
import Product from "../../models/product.model";
import { json } from "body-parser";
import { paginationHelper } from "../../helpers/pagination.helper";
import { Op, QueryTypes } from "sequelize";
import sequelize from "../../configs/database";
import { convertToSlug } from "../../helpers/convert-to-slug.helper";


//[GET] /product
export const index = async(req: Request, res: Response) => {
    try {
        
        let find = {
            status: "active",
            deleted: false,
        };

        let category_id = req.query["category_id"] as string;
        if(category_id)
        {
            let ids = await sequelize.query(`
                WITH RECURSIVE category_hierarchy AS (
                    SELECT category_id, parent_category_id, category_title
                    FROM categories
                    WHERE category_id = ${parseInt(category_id)} 
    
                    UNION ALL
    
                    SELECT c.category_id, c.parent_category_id, c.category_title
                    FROM categories c
                    INNER JOIN category_hierarchy ch ON c.parent_category_id = ch.category_id
                )
                SELECT p.product_id
                FROM products p
                WHERE p.category_id IN (SELECT category_id FROM category_hierarchy);
            `, {
                raw: true,
                type: QueryTypes.SELECT
            });
    
            ids = ids.map(item => {return item["product_id"]});

            find["product_id"] = {
                [Op.in]: ids
            }
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

        console.log("----------------------------------------")

        // ---- giá mới + đếm số lượng sản phẩm đã bán + rating ---
        for (const item of products) {
            const newPrice = item["price_unit"] * (1 - item["discount"] / 100);
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

            console.log(parseFloat(ratingAVG[0]["rating"]))

            item["rating"] = parseFloat(ratingAVG[0]["rating"]) || 0
        }

        
        

    

        // Sau khi đã lọc xong -> phân trang
        const countProducts = products.length;
        const objectPagination = paginationHelper(req, countProducts);

        // Áp dụng phân trang
        const paginatedProducts = products.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);

        // console.log(paginatedProducts);


        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            data: paginatedProducts,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"],
            fromPrice: fromPrice,
            toPrice: toPrice
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi load create category"
        })
    }
}




//[GET] /detail/:product_id
export const detail = async(req: Request, res: Response) => {
    try {
        
        const product_id = req.params.product_id as string;

        const product = await Product.findOne(
            {
                where:{
                product_id: product_id,
                deleted: false
            },
            raw: true
        })

        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            data: product,
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi load create category"
        })
    }
}

//[GET] /product/create.js
export const create = async(req: Request, res: Response) => {
    try {
        
        const listCategories = await Category.findAll({
            where:{
                deleted: false
            },
            raw: true
        });

        const newListCategories = createTreeHelper(listCategories);

        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            categories: newListCategories,
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi load create category"
        })
    }
}

//[POST] /product/create.js
// export const createPost = (req: Request, res: Response) => {
    
//     // console.log(req["file"]);

//     ////---upload ảnh input (1)----
//     // console.log(req.body[req["file"]["fieldname"]]);
//     ////---end upload ảnh input (1)----

//     //----textarea tinymce----
//     console.log(req.body);
//     //----end textarea tinymce----

//     res.json({
//         code: 200
//     })
// }

// //[POST] /product/create.js
// export const createPost2 = (req: Request, res: Response) => {
    
//     // upload nhiều field
//     // console.log(req["files"]);
//     console.log(req.body);

//     res.json({
//         code: 200
//     })
// }

// //[POST] /product/create.js
// export const createPost3 = (req: Request, res: Response) => {
    
//     // console.log(req["files"]);

//     console.log(req.body);

//     res.json({
//         code: 200
//     })
// }

//[POST] /product/create
export const createPost = async (req: Request, res: Response) => {
    try {
        
        if(req.body["category_id"])
        {
            req.body["category_id"] = parseInt( req.body["category_id"])
        }
        if(req.body["price_unit"])
        {
            req.body["price_unit"] = parseInt( req.body["price_unit"])
        }
        if(req.body["quantity"])
        {
            req.body["quantity"] = parseInt( req.body["quantity"])
        }
        if(req.body["discount"])
        {
            req.body["discount"] = parseInt( req.body["discount"])
        }
        if(req.body["image_url"])
        {
            req.body["image_url"] = JSON.stringify(req.body["image_url"]);
        }
        console.log(req.body);

        await Product.create(req.body);

        return res.json({
            code: 200,
            message: "Tạo mới sản phẩm thành công"
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi tạo mới sản phẩm"
        })
    }
}

//[GET] /product/edit/:product_id
export const edit = async(req: Request, res: Response) => {
    try {

        const product_id = req.params["product_id"];
        
        const product = await Product.findOne({
            where:{
                deleted: false,
                product_id: parseInt(product_id)
            },
            raw: true
        });

        const listCategories = await Category.findAll({
            where:{
                deleted: false
            },
            raw: true
        });

        const newListCategories = createTreeHelper(listCategories);

        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            data: product,
            categories: newListCategories,
        })

        // return res.render("admin/pages/products/edit.pug");

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi load dữ liệu sản phẩm"
        })
    }
}

//[PATCH] /product/edit/:product_id
export const editPost = async(req: Request, res: Response) => {
    try {

        console.log(req.body)

        const product_id = req.params["product_id"];

        if(req.body["category_id"])
        {
            req.body["category_id"] = parseInt( req.body["category_id"])
        }
        if(req.body["price_unit"])
        {
            req.body["price_unit"] = parseInt( req.body["price_unit"])
        }
        if(req.body["quantity"])
        {
            req.body["quantity"] = parseInt( req.body["quantity"])
        }
        if(req.body["discount"])
        {
            req.body["discount"] = parseInt( req.body["discount"])
        }
        if(req.body["description"])
        {
            req.body["product_desc"] = req.body["description"]
        }
        if(req.body["image_url"])
        {
            req.body["image_url"] = JSON.stringify(req.body["image_url"]);
        }
        console.log(req.body);

        await Product.update({
            ...req.body
        }, {
            where: {
                product_id: parseInt(product_id)
            }
        })

        const product = await Product.findOne({
            where:{
                deleted: false,
                product_id: parseInt(product_id)
            },
            raw: true
        });

        return res.json({
            code: 200,
            message: "Chỉnh sửa sản phẩm thành công",
            data: product_id
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi chỉnh sửa sản phẩm"
        })
    }
}

//[DELETE] /product/del/:product_id
export const del = async(req: Request, res: Response) => {
    try {

        const product_id = req.params["product_id"];

        await Product.update({
            deleted: true
        }, {
            where: {
                product_id: parseInt(product_id)
            }
        })
        
        return res.json({
            code: 200,
            message: "Xóa sản phẩm thành công!",
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi xóa sản phẩm"
        })
    }
}