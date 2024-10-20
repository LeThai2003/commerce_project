"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const Order = database_1.default.define("Order", {
    order_id: {
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
            key: "cart_id",
        }
    },
    order_desc: {
        type: sequelize_1.DataTypes.STRING(300),
    },
    order_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    order_fee: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    address: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: "address",
            key: "address_id"
        }
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(15)
    },
}, {
    tableName: 'orders',
    timestamps: true,
});
exports.default = Order;
