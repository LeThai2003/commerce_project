"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const OrderItem = database_1.default.define("OrderItem", {
    order_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "orders",
            key: "order_id"
        }
    },
    product_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "products",
            key: "product_id"
        }
    },
    ordered_quantity: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    price_unit: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    discount: {
        type: sequelize_1.DataTypes.INTEGER,
    }
}, {
    tableName: 'order_items',
    timestamps: true,
});
exports.default = OrderItem;
