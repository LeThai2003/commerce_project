import { Express, Request, Response } from "express";
import Category from "../../models/category.model";
import { createTreeHelper } from "../../helpers/create-tree.helper";
import { paginationHelper } from "../../helpers/pagination.helper";
import sequelize from "../../configs/database";
import { QueryTypes } from "sequelize";
import Blog from "../../models/blog.model";



//[GET] admin/categories/
export const index = async (req: Request, res: Response) => {
    try {
        
        const listCategories = await Category.findAll({
            where:{
                deleted: false
            },
            raw: true
        });

        const objectPagination = paginationHelper(req, listCategories.length);

        const paginatedCategories = listCategories.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);
        
        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            data: paginatedCategories,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"]
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi load category " + error
        })
    }
}
//[GET] admin/categories/:category_id
export const productsOfCategory = async (req: Request, res: Response) => {
    try {
        const category_id = req.params.category_id as string;

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
        })  // list product's id of a category

        // [
        //     {
        //         "product_id": 2
        //     },
        //     {
        //         "product_id": 8
        //     },
        //     {
        //         "product_id": 9
        //     },
        //     {
        //         "product_id": 10
        //     },
        //     {
        //         "product_id": 11
        //     }
        // ]

        ids = ids.map(item => {return item["product_id"]})
        
        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            data: ids,

        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi load category " + error
        })
    }
}

//[POST] /blogs/create.js
export const createPost = async (req: Request, res: Response) => {
    try {
        
        console.log(req.body);

        await Blog.create({
            title: req.body["title"],
            content: req.body["content"],
            image_url: JSON.stringify(req.body["image_url"])
        });

        return res.json({
            code: 200,
            message: "post a blog successfully"
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi post blog"
        })
    }
}

