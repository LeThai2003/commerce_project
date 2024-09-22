import { Express, Request, Response } from "express";



//[GET] /product/create.js
export const create = (req: Request, res: Response) => {
    

    res.render("admin/pages/products/create.pug")
}

//[POST] /product/create.js
export const createPost = (req: Request, res: Response) => {
    
    // console.log(req["file"]);

    console.log(req.body[req["file"]["fieldname"]]);

    res.json({
        code: 200
    })
}