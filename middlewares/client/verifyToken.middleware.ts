import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import Credential from "../../models/credential.model";
import VerificationToken from "../../models/verification-token.model";
import { Op } from "sequelize";

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    if(req.headers['authorization'])
    {
        const token = req.headers['authorization'].split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
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
                        verif_token: token,
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