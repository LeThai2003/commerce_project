"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
const index = (req, res) => {
    try {
        console.log("---");
        console.log(req.body);
        return res.json(req.body["image_url"]);
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi " + error,
        });
    }
};
exports.index = index;
