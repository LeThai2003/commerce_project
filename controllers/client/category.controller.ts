import { Express, Request, Response } from "express";
import Category from "../../models/category.model";
import { createTreeHelper } from "../../helpers/create-tree.helper";
import Product from "../../models/product.model";
import sequelize from "../../configs/database";
import { QueryTypes } from "sequelize";
import { convertToSlug } from "../../helpers/convert-to-slug.helper";

//[GET] /categories
export const index = async(req: Request, res: Response) => {
    try {
        
        const listCategories = await Category.findAll({
            where:{
                deleted: false
            },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deleted'] },
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
            code: 500,
            message: "Lỗi load create category"
        })
    }
}

//[GET] /categories/:category_id
export const getProductCategory = async(req: Request, res: Response) => {
    try {
        
        const category_id = req.params["category_id"] as string;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5; 
        const offset = (page - 1) * limit;   
        const sortKey = (req.query.sortKey as string).toUpperCase() || 'product_title';      
        const sortValue = (req.query.sortValue as string).toUpperCase() || 'ASC'; 
        let searchKey = (req.query.searchKey as string) || "";
        searchKey = convertToSlug(searchKey.toLowerCase());

        const products = await sequelize.query(`
                WITH RECURSIVE category_hierarchy AS (
                    SELECT category_id, parent_category_id, category_title
                    FROM categories
                    WHERE category_id = ${parseInt(category_id)}  -- danh mục gốc mà bạn click vào

                    UNION ALL

                    SELECT c.category_id, c.parent_category_id, c.category_title
                    FROM categories c
                    INNER JOIN category_hierarchy ch ON c.parent_category_id = ch.category_id
                )
                SELECT p.product_id, p.product_title, p.product_desc, p.image_url, p.price_unit, p.quantity, p.discount, p.slug
                FROM products p
                WHERE p.category_id IN (SELECT category_id FROM category_hierarchy)
                AND p.slug LIKE '%${searchKey}%'
                ORDER BY ${sortKey} ${sortValue}
                LIMIT ${limit} OFFSET ${offset};
            `, {
                raw: true,
                type: QueryTypes.SELECT
            })
        
        const totalPage = Math.ceil(products.length / limit);

        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            data: products,
            page: page,
            totalPage: totalPage
        })

    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi load product of category " + error
        })
    }
}