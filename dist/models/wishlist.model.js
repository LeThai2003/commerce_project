"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const Wishlist = database_1.default.define("Wishlish", {
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: "users",
            key: "user_id"
        }
    },
    product_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: "products",
            key: "product_id"
        }
    },
    like_date: {
        type: sequelize_1.DataTypes.DATE,
    }
}, {
    timestamps: true,
    tableName: "wishlist"
});
exports.default = Wishlist;
