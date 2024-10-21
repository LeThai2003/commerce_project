"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalRevenueWithYear = exports.getYears = exports.totalRevenue = void 0;
const database_1 = __importDefault(require("../../configs/database"));
const sequelize_1 = require("sequelize");
const totalRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let dataFromSelect = yield database_1.default.query(`
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
            `, {
            raw: true,
            type: sequelize_1.QueryTypes.SELECT
        });
        const data = [];
        for (const item of dataFromSelect) {
            item["year"] = parseInt(item["year"]);
            item["month"] = parseInt(item["month"]);
            item["total_revenue"] = parseInt(item["total_revenue"]);
            if (data.length == 0) {
                data.push({
                    year: item["year"],
                    data: [
                        {
                            month: item["month"],
                            total_revenue: item["total_revenue"]
                        }
                    ]
                });
            }
            else {
                const index = data.indexOf(result_item => result_item["year"] === item["year"]);
                console.log(index);
                const a = data.find(result_item => result_item["year"] === item["year"]);
                console.log(a);
                if (index !== -1) {
                    data[index]["data"].push({
                        month: item["month"],
                        total_revenue: item["total_revenue"]
                    });
                }
                else {
                    data.push({
                        year: item["year"],
                        data: [
                            {
                                month: item["month"],
                                total_revenue: item["total_revenue"]
                            }
                        ]
                    });
                }
            }
        }
        let dataYear = yield database_1.default.query(`
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
            `, {
            raw: true,
            type: sequelize_1.QueryTypes.SELECT
        });
        return res.json({
            code: 200,
            message: "Báo cáo doanh thu thành công",
            data: data
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi báo cáo doanh thu " + error
        });
    }
});
exports.totalRevenue = totalRevenue;
const getYears = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let dataYear = yield database_1.default.query(`
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
            `, {
            raw: true,
            type: sequelize_1.QueryTypes.SELECT
        });
        for (const item of dataYear) {
            item["year"] = parseInt(item["year"]);
        }
        return res.json({
            code: 200,
            message: "Lấy số năm thành công",
            data: dataYear
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy số năm " + error
        });
    }
});
exports.getYears = getYears;
const totalRevenueWithYear = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const year = req.params["year"];
        let data = yield database_1.default.query(`
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
            `, {
            raw: true,
            type: sequelize_1.QueryTypes.SELECT
        });
        for (const item of data) {
            item["month"] = parseInt(item["month"]);
            item["total_revenue"] = parseInt(item["total_revenue"]);
        }
        return res.json({
            code: 200,
            message: "Lấy doanh thu theo năm thành công",
            data: data
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy doanh thu theo năm " + error
        });
    }
});
exports.totalRevenueWithYear = totalRevenueWithYear;
