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
            message: "Refresh token is required."
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
                message: "Invalid refresh token."
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
            code: 400,
            message: "Error refreshing token."
        };
    }
};

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers["accesstoken"]) {
        const accessToken = req.headers["accesstoken"];

        try {
            const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);
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
                    message: 'Account not activated or does not exist.'
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
                    code: 403,
                    message: 'Invalid token. Access denied.'
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

            next();
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                // Nếu token hết hạn, gọi hàm refreshToken
                const refreshToken = req.headers["refreshtoken"] as string; 

                if (refreshToken) 
                {
                    const refreshResult = await refreshTokenHandler(refreshToken);

                    if (refreshResult.code === 200) 
                    {
                        res.setHeader('accesstoken', refreshResult.token);
                        next();
                    } 
                    else 
                    {
                        return res.json({
                            code: refreshResult.code,
                            message: refreshResult.message
                        });
                    }
                } 
                else 
                {
                    return res.json({
                        code: 403,
                        message: 'Access token expired. No refresh token provided.'
                    });
                }
            } else {
                return res.json({
                    code: 401,
                    message: 'Invalid token. Access denied.'
                });
            }
        }
    } else {
        return res.json({
            code: 403,
            message: 'Access denied. No token provided.'
        });
    }
};

export default verifyToken;