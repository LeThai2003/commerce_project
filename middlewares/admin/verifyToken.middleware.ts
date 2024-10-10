import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import Credential from "../../models/credential.model";
import VerificationToken from "../../models/verification-token.model";
import { Op } from "sequelize";
import User from "../../models/user.model";

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    if(req.headers["token_manager"])
    {
        const token_manager = req.headers["token_manager"];

        try {
            const decoded = jwt.verify(token_manager, process.env.SECRET_KEY);
            const { credential_id } = decoded;

            const credential = await Credential.findOne({
                where: {
                    credential_id: credential_id,
                    is_enabled: true,
                },
                raw: true,
            });

            if (!credential) {
                return res.json({ 
                    code: 400,
                    message: 'Account not activated or does not exist.' // + hết hạn 
                });
            }
            else    // nếu có nhưng người đó đẵ đăng xuất rồi
            {
                const isValidToken = await VerificationToken.findOne({
                    where:{
                        token_type: "access",
                        verif_token: token_manager,
                        expire_date: {
                            [Op.gt] : new Date(Date.now())
                        }
                    },
                    raw: true,
                });

                if(!isValidToken)
                {
                    return res.json({
                        code: 401,
                        message: 'Invalid token. Access denied.'
                    });
                }
            }

            req["credential_id"] = credential_id; 

            const admin = await User.findOne({
                where: {
                    credential_id: credential["credential_id"]
                },
                raw: true
            });

            res.locals.user = admin;
            
            next();
        } catch (error) {
            return res.json({
                code: 401,
                message: 'Invalid token. Access denied.'
            });
        }
    }
    else
    {
        return res.json({ 
            code: 403,
            message: 'Access denied. No token provided.' 
        });
    }
    
}

export default verifyToken;