"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
const index = (req, res) => {
    try {
        console.log(req.body);
        res.json({
            "location": req.body["file"]
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.index = index;
