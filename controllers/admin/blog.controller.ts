import { Express, Request, Response } from "express";
import Category from "../../models/category.model";
import { createTreeHelper } from "../../helpers/create-tree.helper";
import { paginationHelper } from "../../helpers/pagination.helper";
import sequelize from "../../configs/database";
import { QueryTypes } from "sequelize";
import Blog from "../../models/blog.model";



//[GET] admin/blogs/
export const index = async (req: Request, res: Response) => {
    try {

        const blogsList = await Blog.findAll({
            where: {
                deleted: false
            },
            attributes: {exclude: ['deleted', 'updatedAt']},
            raw: true
       })

       console.log(blogsList);

        const objectPagination = paginationHelper(req, blogsList.length);

        const paginatedBlogs = blogsList.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);
        

        return res.json({
            code: 200,
            message: "Lấy danh sách blogs thành công",
            data: paginatedBlogs,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"]
        })
        
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy danh sách blogs " + error
        })
    }
}

//[GET] admin/blogs/detail/:blog_id
export const detail = async (req: Request, res: Response) => {
    try {
        const blogId = req.params["blog_id"];

        const blog = await Blog.findOne({
            where: {
                deleted: false,
                blog_id: blogId
            },
            attributes: {exclude: ['deleted', 'updatedAt']},
            raw: true
       })

        console.log(blog);
        

        return res.json({
            code: 200,
            message: "Lấy danh sách blogs thành công",
            data: blog
        })
        
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy danh sách blogs " + error
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

//[PATCH] /blogs/edit/:blog_id
export const editPatch = async (req: Request, res: Response) => {
    try {
        const blogId = req.params["blog_id"];
        console.log(req.body);

        if(req.body["image_url"])
        {
            req.body["image_url"] = JSON.stringify(req.body["image_url"])
        }

        await Blog.update({
            ...req.body
        }, {
            where: {
                blog_id: blogId
            }
        });

        return res.json({
            code: 200,
            message: "Edit a blog successfully"
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi edit blog"
        })
    }
}

//[DELETE] /blogs/delete/:blog_id
export const deleteBlog = async (req: Request, res: Response) => {
    try {
        const blogId = req.params["blog_id"];

        await Blog.update({
            deleted: 1
        }, {
            where: {
                blog_id: blogId
            }
        });

        return res.json({
            code: 200,
            message: "Delete a blog successfully"
        })

    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi delete blog"
        })
    }
}

