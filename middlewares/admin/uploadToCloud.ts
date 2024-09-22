import { Express, NextFunction, Request, Response } from "express";

import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_KEY, 
    api_secret: process.env.CLOUD_SECRET 
});

export const uploadSingle = function (req: Request, res: Response, next: NextFunction) {
    if(req["file"])
    {
        let streamUpload = (req: Request) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                  (error, result) => {
                    if (result) {
                      resolve(result);
                    } else {
                      reject(error);
                    }
                  }
                );
    
              streamifier.createReadStream(req["file"].buffer).pipe(stream);
            });
        };
    
        async function upload(req: Request) {
            let result = await streamUpload(req);
            req.body[req["file"]["fieldname"]] = result["url"];
            next();
        }
    
        upload(req);
    }
    else
    {
        next();
    }
}