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
exports.index = void 0;
const product_model_1 = __importDefault(require("../../models/product.model"));
const sequelize_1 = require("sequelize");
const convert_to_slug_helper_1 = require("../../helpers/convert-to-slug.helper");
const pagination_helper_1 = require("../../helpers/pagination.helper");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.query);
        let find = {
            status: "active",
            deleted: false,
        };
        const sort = [];
        if (req.query["sortKey"] && req.query["sortValue"]) {
            const sortKey = req.query["sortKey"];
            const sortValue = req.query["sortValue"];
            if (typeof sortValue === 'string') {
                const formattedSortValue = sortValue.toUpperCase();
                sort.push([sortKey, formattedSortValue]);
            }
            else {
                console.error('sortValue is not a string');
            }
        }
        if (req.query["fromPrice"] && req.query["toPrice"]) {
            const fromPriceQuery = req.query["fromPrice"];
            const toPriceQuery = req.query["toPrice"];
            if (typeof fromPriceQuery === 'string' && typeof toPriceQuery === 'string') {
                let price1 = parseInt(fromPriceQuery);
                let price2 = parseInt(toPriceQuery);
                find["price_unit"] = {
                    [sequelize_1.Op.and]: [
                        { [sequelize_1.Op.gte]: price1 },
                        { [sequelize_1.Op.lte]: price2 },
                    ]
                };
            }
        }
        if (req.query["searchKey"]) {
            const titleFromSearh = req.query["searchKey"];
            if (typeof titleFromSearh === "string") {
                let title = (0, convert_to_slug_helper_1.convertToSlug)(titleFromSearh.toLowerCase());
                find["slug"] = { [sequelize_1.Op.like]: `%${title}%` };
            }
        }
        const countProducts = yield product_model_1.default.count({
            where: find
        });
        const objectPagination = (0, pagination_helper_1.paginationHelper)(req, countProducts);
        const products = yield product_model_1.default.findAll({
            where: find,
            order: sort,
            limit: objectPagination["limit"],
            offset: objectPagination["offset"],
            raw: true,
        });
        res.json({
            code: 200,
            data: products,
            totalPage: objectPagination["totalPage"]
        });
    }
    catch (error) {
        res.json({
            code: 400,
            message: error
        });
    }
});
exports.index = index;
