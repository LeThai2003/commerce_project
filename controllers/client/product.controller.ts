import { Express, Request, Response } from "express";
import Product from "../../models/product.model";
import { Op } from "sequelize";
import { convertToSlug } from "../../helpers/convert-to-slug.helper";
import { paginationHelper } from "../../helpers/pagination.helper";


//[GET] /product/index.js
export const index = async (req: Request, res: Response) => {
    try {
        // console.log(req["credential_id"]);

        console.log(req.query);

        let find = {
            status: "active",
            deleted: false,
        }

        // sort 
        const sort: [string, string][] = []; // Use a tuple array for sorting

        if (req.query["sortKey"] && req.query["sortValue"]) {
            const sortKey = req.query["sortKey"] as string;

            const sortValue = req.query["sortValue"];
            if (typeof sortValue === 'string') {
                const formattedSortValue = sortValue.toUpperCase();
                sort.push([sortKey, formattedSortValue]);
            } else {
                console.error('sortValue is not a string');
            }
        }
        // end sort

        // filter price
        if(req.query["fromPrice"] && req.query["toPrice"])
        {
            const fromPriceQuery = req.query["fromPrice"];
            const toPriceQuery = req.query["toPrice"];

            if (typeof fromPriceQuery === 'string' && typeof toPriceQuery === 'string') {
                let price1 = parseInt(fromPriceQuery);
                let price2 = parseInt(toPriceQuery);

                find["price_unit"] = {
                    [Op.and]: [
                        {[Op.gte]: price1},
                        {[Op.lte]: price2},
                    ]
                }
            }
        }
        // end filter price

        // search with title
            if(req.query["searchKey"])
            {
                const titleFromSearh = req.query["searchKey"] as string;
                if(typeof titleFromSearh === "string")
                {
                    let title = convertToSlug(titleFromSearh.toLowerCase());
                    find["slug"] = {[Op.like]: `%${title}%`}
                }
            }
        // end search with title

        // pagination
        const countProducts = await Product.count({
            where: find
        });

        const objectPagination = paginationHelper(req, countProducts);
        // end pagination

        const products = await Product.findAll({
            where: find,
            order: sort,
            limit: objectPagination["limit"],
            offset: objectPagination["offset"],
            raw: true,
        });

        // console.log(products);

        return res.json({
            code: 200,
            data: products,
            totalPage: objectPagination["totalPage"]
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: error
        })
    }
}

