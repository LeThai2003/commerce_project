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
exports.postContact = void 0;
const contact_model_1 = __importDefault(require("../../models/contact.model"));
const postContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        yield contact_model_1.default.create({
            fullName: req.body.fullName,
            email: req.body.email,
            title: req.body.title,
            content: req.body.content
        });
        return res.json({
            code: 200,
            message: "Post a contact successfully!",
        });
    }
    catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi post contact " + error
        });
    }
});
exports.postContact = postContact;
