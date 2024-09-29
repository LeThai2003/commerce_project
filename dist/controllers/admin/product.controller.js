"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = exports.create = void 0;
const create = (req, res) => {
    res.render("admin/pages/products/create.pug");
};
exports.create = create;
const createPost = (req, res) => {
    console.log(req["files"]);
    console.log(req.body);
    res.json({
        code: 200
    });
};
exports.createPost = createPost;
