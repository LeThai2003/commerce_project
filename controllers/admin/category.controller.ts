import { Express, Request, Response } from "express";
import Category from "../../models/category.model";
import { createTreeHelper } from "../../helpers/create-tree.helper";



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