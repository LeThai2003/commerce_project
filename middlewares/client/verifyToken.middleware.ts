import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import Credential from "../../models/credential.model";

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    if(req.header('Authorization'))
    {
        const token = req.header('Authorization').split(" ")[1];

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const {credential_id} = decoded;

        const credential = await Credential.findOne({
            where: {
                credential_id: credential_id,
                is_enabled: true,
            },
            raw: true,
        });

        if(!credential)
        {
            return res.json({ 
                code: 400,
                message: 'Account not activated or does not exist.' 
            });
        }

        req["credential_id"] = credential_id;
        next()
    }
    else
    {
        return res.json({ 
            code: 400,
            message: 'Access denied. No token provided.' 
        });
    }
    
}

export default verifyToken;