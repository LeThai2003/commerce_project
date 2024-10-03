"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const PhoneVerification = database_1.default.define("PhoneVerification ", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    otp: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'phone_verification',
    timestamps: false,
});
exports.default = PhoneVerification;
