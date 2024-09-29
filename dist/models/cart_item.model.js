"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const CartItem = database_1.default.define("OrderItem", {
    cart_item_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    cart_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "carts",
            key: "cart_id"
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
    ordered_quantity: {
        type: sequelize_1.DataTypes.INTEGER,
    },
}, {
    tableName: 'cart_items',
    timestamps: true,
});
exports.default = CartItem;
