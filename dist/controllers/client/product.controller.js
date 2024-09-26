"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
const index = (req, res) => {
    console.log(req["credential_id"]);
    res.json({
        hello: "Xin chào"
    });
};
exports.index = index;
