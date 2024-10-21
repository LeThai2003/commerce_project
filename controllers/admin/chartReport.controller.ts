import { Express, Request, Response } from "express";
import Category from "../../models/category.model";
import { createTreeHelper } from "../../helpers/create-tree.helper";
import { paginationHelper } from "../../helpers/pagination.helper";
import sequelize from "../../configs/database";
import { DataTypes, QueryTypes } from "sequelize";
import Blog from "../../models/blog.model";
import Contact from "../../models/contact.model";
import { raw } from "body-parser";



//[GET] admin/reports/total-revenue
export const totalRevenue = async (req: Request, res: Response) => {
    try {

        // dữ liệu doanh thu theo từng tháng - năm
        let dataFromSelect = await sequelize.query(`
            SELECT 
                DATE_FORMAT(payments.updatedAt, '%Y') AS year,
                DATE_FORMAT(payments.updatedAt, '%m') AS month,
                SUM(orders.order_fee) AS total_revenue
            FROM
                orders
            JOIN 
                payments ON orders.order_id = payments.order_id 
            WHERE
                payments.payment_status = 'Đã giao' 
                AND payments.is_payed = 1
            GROUP BY 
                year, month
            ORDER BY 
                year, month ASC;
            `, 
            {
                raw: true,
                type: QueryTypes.SELECT
            }
        )

        const data = [];

        for (const item of dataFromSelect) {
            item["year"] = parseInt(item["year"])
            item["month"] = parseInt(item["month"])
            item["total_revenue"] = parseInt(item["total_revenue"])

            if(data.length == 0)
            {
                data.push({
                    year: item["year"],
                    data: [
                        {
                            month: item["month"],
                            total_revenue: item["total_revenue"]
                        }
                    ]
                })
            }
            else
            {
                const index = data.indexOf(result_item => result_item["year"] === item["year"]);
                console.log(index);
                const a = data.find(result_item => result_item["year"] === item["year"]);
                console.log(a);
                if(index !== -1)
                {
                    data[index]["data"].push({
                        month: item["month"],
                        total_revenue: item["total_revenue"]
                    })
                }
                else
                {
                    data.push({
                        year: item["year"],
                        data: [
                            {
                                month: item["month"],
                                total_revenue: item["total_revenue"]
                            }
                        ]
                    })
                }
            }

        }


        let dataYear = await sequelize.query(`
            SELECT 
                DATE_FORMAT(payments.updatedAt, '%Y') AS year
            FROM
                payments 
            WHERE
                payments.payment_status = 'Đã giao' 
                AND payments.is_payed = 1
            GROUP BY 
                year
            ORDER BY 
                year ASC;
            `, 
            {
                raw: true,
                type: QueryTypes.SELECT
            }
        )

        return res.json({
            code: 200,
            message: "Báo cáo doanh thu thành công",
            data: data
        })
        
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi báo cáo doanh thu " + error
        })
    }
}

//[GET] admin/reports/get-year
export const getYears = async (req: Request, res: Response) => {
    try {

        let dataYear = await sequelize.query(`
            SELECT 
                DATE_FORMAT(payments.updatedAt, '%Y') AS year
            FROM
                payments 
            WHERE
                payments.payment_status = 'Đã giao' 
                AND payments.is_payed = 1
            GROUP BY 
                year
            ORDER BY 
                year ASC;
            `, 
            {
                raw: true,
                type: QueryTypes.SELECT
            }
        )

        for (const item of dataYear) {
            item["year"] = parseInt(item["year"]);
        }

        return res.json({
            code: 200,
            message: "Lấy số năm thành công",
            data: dataYear
        })
        
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy số năm " + error
        })
    }
}

//[GET] admin/reports/get-year/:year
export const totalRevenueWithYear = async (req: Request, res: Response) => {
    try {
        const year = req.params["year"]

        let data = await sequelize.query(`
            SELECT 
                DATE_FORMAT(payments.updatedAt, '%m') AS month,
                SUM(orders.order_fee) AS total_revenue
            FROM
                orders
            JOIN 
                payments ON orders.order_id = payments.order_id 
            WHERE
                payments.payment_status = 'Đã giao' 
                AND payments.is_payed = 1
                AND year(payments.updatedAt) = ${year}
            GROUP BY 
                month
            ORDER BY 
                month ASC;
            `, 
            {
                raw: true,
                type: QueryTypes.SELECT
            }
        )

        for (const item of data) {
            item["month"] = parseInt(item["month"])
            item["total_revenue"] = parseInt(item["total_revenue"])
        }

        return res.json({
            code: 200,
            message: "Lấy doanh thu theo năm thành công",
            data: data
        })
        
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy doanh thu theo năm " + error
        })
    }
}

