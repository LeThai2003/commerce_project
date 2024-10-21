import { Express, Request, Response } from "express";
import Category from "../../models/category.model";
import { createTreeHelper } from "../../helpers/create-tree.helper";
import { paginationHelper } from "../../helpers/pagination.helper";
import sequelize from "../../configs/database";
import { QueryTypes } from "sequelize";
import Blog from "../../models/blog.model";
import Contact from "../../models/contact.model";



//[GET] admin/contacts/
export const index = async (req: Request, res: Response) => {
    try {

        const contactList = await Contact.findAll({
            where: {
                deleted: false
            },
            attributes: {exclude: ['deleted', 'updatedAt']},
            raw: true
       })

       console.log(contactList);

        const objectPagination = paginationHelper(req, contactList.length);

        const paginatedContacts = contactList.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);
        

        return res.json({
            code: 200,
            message: "Lấy danh sách contacts thành công",
            data: paginatedContacts,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"]
        })
        
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy danh sách contacts " + error
        })
    }
}

//[GET] admin/contact/detail/:contact_id
export const detail = async (req: Request, res: Response) => {
    try {
        const contact_id = req.params["contact_id"];

        const contact = await Contact.findOne({
            where: {
                deleted: false,
                contact_id: contact_id 
            },
            attributes: {exclude: ['deleted', 'updatedAt']},
            raw: true
       })

        return res.json({
            code: 200,
            message: "Lấy contact thành công",
            data: contact
        })
        
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy contact " + error
        })
    }
}

