import { Express, Request, Response } from "express";

//[POST] /admin/upload
export const index = (req: Request, res: Response) => {
    try {
        console.log(req.body);
        return res.json({
            "location": req.body["file"]
        });
    } catch (error) {
        return(console.log(error))
    }
}