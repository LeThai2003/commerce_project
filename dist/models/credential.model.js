"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const Credential = database_1.default.define("Credential", {
    credential_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    username: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false
    },
    password: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false
    },
    role: {
        type: sequelize_1.DataTypes.STRING(50),
    },
    is_enabled: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,
    tableName: "credentials"
});
exports.default = Credential;
