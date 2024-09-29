import { NextFunction, Request, Response } from "express";

export const createProductValidation = (req: Request, res: Response, next: NextFunction) => {
    console.log("Chạy vào đây!");
    if(!req.body["product_title"].trim())
    {
        res.json({
            code: 400,
            message: "Tiêu đề không để trống"
        })
    }
    if(!parseInt(req.body["price_unit"]))
    {
        res.json({
            code: 400,
            message: "Tiền không được để trống"
        })
    }
    if(!parseInt(req.body["quantity"]))
    {
        res.json({
            code: 400,
            message: "Số lượng không được để trống"
        })
    }

    next();
}