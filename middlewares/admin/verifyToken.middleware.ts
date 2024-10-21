import jwt from "jsonwebtoken";
import { TokenExpiredError } from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";
import Credential from "../../models/credential.model";
import VerificationToken from "../../models/verification-token.model";
import User from "../../models/user.model";
import { error } from "console";
import Admin from "../../models/admin.model";


const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    let accessToken = req.headers["authorization"];
    console.log( "Logout: ==============1==========" + accessToken);
    if (accessToken) {
        try {
            accessToken = accessToken.split(" ")[1]
            const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);
            const { credential_id } = decoded;

            console.log("Logout: =============2===========" + accessToken);
            console.log("Logout: =============3===========" + credential_id);

            const credential = await Credential.findOne({
                where: {
                    credential_id: credential_id,
                    is_enabled: true,
                },
                raw: true,
            });

            if (!credential) {
                return res.json({
                    code: 404,
                    message: 'Tài khoản không tồn tại'
                });
            }

            // Kiểm tra token có hợp lệ không
            const isValidToken = await VerificationToken.findOne({
                where: {
                    token_type: "access",
                    verif_token: accessToken,
                },
                raw: true,
            });

            if (!isValidToken) {
                return res.json({
                    code: 401,
                    message: 'Token không hợp lệ. Truy cập bị từ chối-TẠi sao--'
                });
            }

            req["credential_id"] = credential_id;

            const admin = await Admin.findOne({
                where: {
                    credential_id: credential["credential_id"]
                },
                raw: true
            });

            console.log(admin);

            res.locals.admin = admin;

            console.log("-----------5---------------");

            next();
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                // Nếu token hết hạn, gọi hàm refreshToken
                return res.json({
                    code: 400,
                    message: "access-token-expired"
                })
                
            } 
        }
    } else {
        return res.json({
            code: 403,
            message: 'Từ chối truy cập. Không có token----' + error
        });
    }
};

export default verifyToken;