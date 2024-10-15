"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const Category = database_1.default.define("Category", {
    category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    parent_category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: "categories",
            key: "category_id"
        }
    },
    category_title: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    image_url: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: "active",
        allowNull: false,
    },
    deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'categories',
    timestamps: true,
});
exports.default = Category;
