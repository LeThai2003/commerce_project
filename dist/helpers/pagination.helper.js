"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationHelper = void 0;
const paginationHelper = (req, countItems) => {
    let objectPagination = {
        page: 1,
        limit: 5,
    };
    if (req.query["page"]) {
        const pageQuery = req.query["page"];
        if (typeof pageQuery === 'string') {
            objectPagination["page"] = parseInt(pageQuery);
        }
    }
    objectPagination["offset"] = (objectPagination["page"] - 1) * objectPagination["limit"];
    objectPagination["totalPage"] = Math.ceil(countItems / objectPagination["limit"]);
    return objectPagination;
};
exports.paginationHelper = paginationHelper;
