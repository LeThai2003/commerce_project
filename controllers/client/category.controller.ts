import { Express, Request, Response } from "express";
import Category from "../../models/category.model";
import { createTreeHelper } from "../../helpers/create-tree.helper";
import Product from "../../models/product.model";

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
            code: 400,
            message: "Lỗi load create category"
        })
    }
}