"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
const index = (req, res) => {
    try {
        console.log(req.body);
        return res.json({
            "location": req.body["file"]
        });
    }
    catch (error) {
        return (console.log(error));
    }
};
exports.index = index;
