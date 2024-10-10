import { NextFunction, Request, Response } from "express";

export const registerValidation = (req: Request, res: Response, next: NextFunction) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regexPhoneNumber = /^(0[3-9]\d{8})$/;

    if(!req.body["username"].trim())
    {
        return res.json({
            code: 400,
            message: "Tên đăng nhập không được để trống"
        })
    }
    if(!req.body["password"])
    {
        return res.json({
            code: 400,
            message: "Mật khẩu không được để trống"
        })
    }
    if(!req.body["first_name"])
    {
        return res.json({
            code: 400,
            message: "Tên không được để trống"
        })
    }
    if(!req.body["email"])
    {
        return res.json({
            code: 400,
            message: "Email không được để trống"
        })
    }
    if(!req.body["email"].trim().match(emailRegex))
    {
        return res.json({
            code: 400,
            message: "Email không đúng định dạng"
        })
    } 
    if(req.body["phone"] && !req.body["phone"].trim().match(regexPhoneNumber))
    {
        return res.json({
            code: 400,
            message: "Số điện thoại không đúng định dạng"
        })
    } 

    next();
}

export const resetPasswordValidation = (req: Request, res: Response, next: NextFunction) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if(!req.body["email"])
    {
        return res.json({
            code: 400,
            message: "Email không được để trống"
        })
    }
    if(!req.body["email"].trim().match(emailRegex))
    {
        return res.json({
            code: 400,
            message: "Email không đúng định dạng"
        })
    } 
    
    if(!req.body["password"])
    {
        return res.json({
            code: 400,
            message: "Mật khẩu không được để trống"
        })
    }

    if(!req.body["comfirmPassword"])
    {
        return res.json({
            code: 400,
            message: "Xác nhận mật khẩu không được để trống"
        })
    }

    if(req.body["password"] !== req.body["comfirmPassword"])
    {
        return res.json({
            code: 400,
            message: "Xác nhận mật khẩu không đúng"
        })
    }
    

    next();
}

export const forgotPasswordValidation = (req: Request, res: Response, next: NextFunction) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if(!req.body["email"])
    {
        return res.json({
            code: 400,
            message: "Email không được để trống"
        })
    }
    if(!req.body["email"].trim().match(emailRegex))
    {
        return res.json({
            code: 400,
            message: "Email không đúng định dạng"
        })
    } 

    next();
}

export const loginValidation = (req: Request, res: Response, next: NextFunction) => {
    if(!req.body["username"].trim())
    {
        return res.json({
            code: 400,
            message: "Tên đăng nhập không được để trống"
        })
    }
    if(!req.body["password"])
    {
        return res.json({
            code: 400,
            message: "Mật khẩu không được để trống"
        })
    }

    next();
}