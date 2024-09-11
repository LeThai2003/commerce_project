import { Express, Request, Response } from "express";


//[GET] /product/index.js
export const index = (req: Request, res: Response) => {
    
    res.json({
        hello: "Xin chào"
    });
}