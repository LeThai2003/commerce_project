"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const Payment = database_1.default.define("Payment", {
    payment_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "orders",
            key: "order_id"
        }
    },
    is_payed: {
        type: sequelize_1.DataTypes.INTEGER,
    },
    payment_status: {
        type: sequelize_1.DataTypes.STRING(50),
    },
    deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'payments',
    timestamps: true,
});
exports.default = Payment;
