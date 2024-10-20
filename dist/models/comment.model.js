"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const Comment = database_1.default.define("Comment", {
    comment_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "user_id"
        }
    },
    product_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "products",
            key: "product_id"
        }
    },
    parent_comment_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "comment",
            key: "comment_id"
        }
    },
    content: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true,
    },
    star: {
        type: sequelize_1.DataTypes.DECIMAL(1),
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
    tableName: "comment"
});
exports.default = Comment;
