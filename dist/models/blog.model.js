"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const Blog = database_1.default.define("Blog", {
    blog_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: false
    },
    content: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true,
    },
    image_url: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true
    },
    deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,
    tableName: "blogs"
});
exports.default = Blog;
