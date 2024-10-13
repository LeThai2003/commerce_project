"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const ForgotPassword = database_1.default.define("ForgotPassword ", {
    forgot_password_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: sequelize_1.DataTypes.STRING(60),
        allowNull: false,
    },
    otp: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    verify_otp: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'forgotpasswords',
    timestamps: false,
});
exports.default = ForgotPassword;
