import { Request } from "express";

export const paginationHelper = (req: Request, countItems: number) => {
    let objectPagination = {
        page: 1,
        limit: 4,
    }

    if(req.query["page"])
    {
        const pageQuery = req.query["page"];
        if(typeof pageQuery === 'string')
        {
            objectPagination["page"] = parseInt(pageQuery);
        }
    }

    objectPagination["offset"] = (objectPagination["page"] - 1) * objectPagination["limit"];

    objectPagination["totalPage"] = Math.ceil(countItems / objectPagination["limit"]);

    return objectPagination;
}