import { Request } from "express";

export const paginationHelper = (req: Request, countItems: number) => {
    let objectPagination = {
        page: 1,
        limit: 8,
    }

    if(req.query["page"])
    {
        const pageQuery = req.query["page"];
        if(typeof pageQuery === 'string')
        {
            objectPagination["page"] = parseInt(pageQuery);
        }
    }

    if(req.query["limit"])
    {
        const limitQuery = req.query["limit"];
        if(typeof limitQuery === 'string')
        {
            objectPagination["limit"] = parseInt(limitQuery);
        }
    }

    objectPagination["offset"] = (objectPagination["page"] - 1) * objectPagination["limit"];

    objectPagination["totalPage"] = Math.ceil(countItems / objectPagination["limit"]);

    return objectPagination;
}