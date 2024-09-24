import { Express, NextFunction, Request, Response } from "express";

import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_KEY, 
    api_secret: process.env.CLOUD_SECRET 
});

export const streamUpload = (buffer) => {
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

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const upload = async (buffer) => {
  let result = await streamUpload(buffer);
  return result["url"];
}

export const uploadSingle = async (req: Request, res: Response, next: NextFunction) => {
  if(req["file"])
  {
    const result = await upload(req["file"].buffer);
    console.log(result);
    req.body[req["file"]["fieldname"]] = result;
    next();
  }
  else
  {
      next();
  }
}