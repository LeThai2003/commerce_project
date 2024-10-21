"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const PaymentStatus = database_1.default.define("PaymentStatus", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    status: {
        type: sequelize_1.DataTypes.STRING(30),
    }
}, {
    tableName: 'paymentStatus',
    timestamps: false,
});
exports.default = PaymentStatus;
