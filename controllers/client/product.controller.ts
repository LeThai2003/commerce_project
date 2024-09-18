import { Express, Request, Response } from "express";


//[GET] /product/index.js
export const index = (req: Request, res: Response) => {
    
    console.log(req["credential_id"]);

    res.json({
        hello: "Xin chào"
    });
}