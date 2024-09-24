import { Express, Request, Response } from "express";

//[GET] /admin/upload
export const index = (req: Request, res: Response) => {
    try {
        console.log(req.body);
        res.json({
            "location": req.body["file"]
        });
    } catch (error) {
        console.log(error)
    }
}