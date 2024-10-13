import jwt from "jsonwebtoken";
import { TokenExpiredError } from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";
import Credential from "../../models/credential.model";
import VerificationToken from "../../models/verification-token.model";
import { Op } from "sequelize";
import User from "../../models/user.model";


const refreshTokenHandler = async (token: string) => {
    if (!token) {
        return {
            code: 402,
            message: "Yêu cầu refresh token"
        };
    }

    try {
        const tokenData = await VerificationToken.findOne({
            where: {
                verif_token: token,
                token_type: "refresh",
                expire_date: {
                    [Op.gt]: new Date(Date.now())
                }
            },
            raw: true
        });

        if (!tokenData) {
            return {
                code: 401,
                message: "Token không hợp lệ"
            };
        }

        // Tạo accessToken
        const newAccessToken = jwt.sign({ credential_id: tokenData["credential_id"] }, process.env.SECRET_KEY, { expiresIn: '12h' });

        // lưu access token mới vào cơ sở dữ liệu
        const verificationData = {
            credential_id: tokenData["credential_id"],
            token_type: "access",
            verif_token: newAccessToken,
            expire_date: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
        };

        await VerificationToken.create(verificationData);

        return {
            code: 200,
            token: newAccessToken
        };

    } catch (error) {
        return {
            code: 500,
            message: "Error refreshing token."
        };
    }
};

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    let accessToken = req.headers["authorization"];
    console.log(accessToken);
    console.log("--------------------------");
    if (accessToken) {
        try {
            accessToken = accessToken.split(" ")[1]
            const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);
            const { credential_id } = decoded;

            console.log("--------------------------");
            console.log(accessToken);
            console.log(credential_id);

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
                    expire_date: {
                        [Op.gt]: new Date(Date.now())
                    }
                },
                raw: true,
            });

            if (!isValidToken) {
                return res.json({
                    code: 401,
                    message: 'Token không hợp lệ. Truy cập bị từ chối'
                });
            }

            req["credential_id"] = credential_id;

            const user = await User.findOne({
                where: {
                    credential_id: credential["credential_id"]
                },
                raw: true
            });

            res.locals.user = user;

            console.log("-----------5---------------");

            next();
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                // Nếu token hết hạn, gọi hàm refreshToken

                const decoded = jwt.decode(accessToken);
                
                const { credential_id } = decoded;

                const record = await VerificationToken.findOne({
                    where: {
                        credential_id: credential_id,
                        token_type: "refresh",
                    },
                    raw: true,
                });

                const refreshToken = record["verif_token"];

                if (refreshToken) 
                {
                    const refreshResult = await refreshTokenHandler(refreshToken);

                    if (refreshResult.code === 200) 
                    {
                        res.setHeader('Access-Control-Expose-Headers', 'accesstoken');
                        res.setHeader('accesstoken', refreshResult.token);

                        const user = await User.findOne({
                            where: {
                                credential_id: credential_id
                            },
                            raw: true
                        });
            
                        res.locals.user = user;

                        next();
                    } 
                    else 
                    {
                        return res.json({
                            code: refreshResult.code
                        });
                    }
                } 
                else 
                {
                    return res.json({
                        code: 401,
                        message: 'Token hết hạn hoặc không có token'
                    });
                }
            } else {
                return res.json({
                    code: 401,
                    message: 'Token không hợp lệ. Từ chối truy cập ---'
                });
            }
        }
    } else {
        return res.json({
            code: 403,
            message: 'Từ chối truy cập. Không có token----'
        });
    }
};

export default verifyToken;