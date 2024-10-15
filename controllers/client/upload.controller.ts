import { Express, Request, Response } from "express";

//[POST] /client/upload
export const index = (req: Request, res: Response) => {
    try {
        console.log("---")
        console.log(req.body);
        return res.json(req.body["image_url"]);
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi " + error,
        });
    }
}