"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detail = exports.index = void 0;
const pagination_helper_1 = require("../../helpers/pagination.helper");
const contact_model_1 = __importDefault(require("../../models/contact.model"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contactList = yield contact_model_1.default.findAll({
            where: {
                deleted: false
            },
            attributes: { exclude: ['deleted', 'updatedAt'] },
            raw: true
        });
        console.log(contactList);
        const objectPagination = (0, pagination_helper_1.paginationHelper)(req, contactList.length);
        const paginatedContacts = contactList.slice(objectPagination["offset"], objectPagination["offset"] + objectPagination["limit"]);
        return res.json({
            code: 200,
            message: "Lấy danh sách contacts thành công",
            data: paginatedContacts,
            totalPage: objectPagination["totalPage"],
            pageNow: objectPagination["page"]
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy danh sách contacts " + error
        });
    }
});
exports.index = index;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact_id = req.params["contact_id"];
        const contact = yield contact_model_1.default.findOne({
            where: {
                deleted: false,
                contact_id: contact_id
            },
            attributes: { exclude: ['deleted', 'updatedAt'] },
            raw: true
        });
        return res.json({
            code: 200,
            message: "Lấy contact thành công",
            data: contact
        });
    }
    catch (error) {
        return res.json({
            code: 400,
            message: "Lỗi lấy contact " + error
        });
    }
});
exports.detail = detail;
