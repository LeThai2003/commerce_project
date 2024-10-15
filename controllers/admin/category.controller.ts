import { Express, Request, Response } from "express";
import Category from "../../models/category.model";
import { createTreeHelper } from "../../helpers/create-tree.helper";
import { paginationHelper } from "../../helpers/pagination.helper";
import sequelize from "../../configs/database";
import { QueryTypes } from "sequelize";



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
//[GET] /categories/create.js
export const create = async (req: Request, res: Response) => {
    try {
        
        const listCategories = await Category.findAll({
            where:{
                deleted: false
            },
            raw: true
        });

        const newListCategories = createTreeHelper(listCategories);

        console.log(newListCategories);

        return res.json({
            code: 200,
            message: "load dữ liệu thành công",
            data: newListCategories,
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi load create category"
        })
    }
}

//[POST] /categories/create.js
export const createPost = async (req: Request, res: Response) => {
    try {
        
        console.log(req.body);

        await Category.create({
            parent_category_id: parseInt(req.body["parent_category_id"]),
            category_title: req.body["category_title"],
            image_url: req.body["image_url"]
        });

        return res.json({
            code: 200,
            message: "Thêm danh mục thành công"
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi create category"
        })
    }
}

//[GET] /categories/edit/:category_id
export const edit = async (req: Request, res: Response) => {
    try {

        const {category_id} = req.params;

        console.log(category_id);
        
        const category = await Category.findOne({
            where: {
                category_id: parseInt(category_id),
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
            message: "Lấy danh mục thành công",
            data: category,
            listCategories: newListCategories
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy dữ liệu danh mục"
        })
    }
}

//[PATCH] /categories/edit/:category_id
export const editPatch = async (req: Request, res: Response) => {
    try {

        const {category_id} = req.params;

        console.log(req.body);

        if(req.body["parent_category_id"])
        {
            req.body["parent_category_id"] = parseInt(req.body["parent_category_id"]);
        }

        await Category.update({
            ...req.body
        }, {
            where:{
                category_id: parseInt(category_id)
            }
        });

        return res.json({
            code: 200,
            message: "Chỉnh sửa danh mục thành công"
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi chỉnh sửa danh mục"
        })
    }
}

//[DELETE] /categories/delete/:category_id
export const del = async (req: Request, res: Response) => {
    try {

        const {category_id} = req.params;

        await Category.update({
            deleted: 1
        }, {
            where:{
                category_id: parseInt(category_id)
            }
        });

        return res.json({
            code: 200,
            message: "Xóa danh mục thành công"
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi xóa danh mục"
        })
    }
}