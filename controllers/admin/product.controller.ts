import { Express, Request, Response } from "express";



//[GET] /product/create.js
export const create = (req: Request, res: Response) => {
    

    res.render("admin/pages/products/create.pug")
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

export const createPost = (req: Request, res: Response) => {
    
    console.log(req["files"]);

    console.log(req.body);

    res.json({
        code: 200
    })
}