import { Express, Request, Response } from "express";
import Category from "../../models/category.model";
import { createTreeHelper } from "../../helpers/create-tree.helper";
import Product from "../../models/product.model";
import { json } from "body-parser";



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