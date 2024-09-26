"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost3 = exports.createPost2 = exports.createPost = exports.create = void 0;
const create = (req, res) => {
    res.render("admin/pages/products/create.pug");
};
exports.create = create;
const createPost = (req, res) => {
    console.log(req.body);
    res.json({
        code: 200
    });
};
exports.createPost = createPost;
const createPost2 = (req, res) => {
    console.log(req.body);
    res.json({
        code: 200
    });
};
exports.createPost2 = createPost2;
const createPost3 = (req, res) => {
    console.log(req.body);
    res.json({
        code: 200
    });
};
exports.createPost3 = createPost3;
