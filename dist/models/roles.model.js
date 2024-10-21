"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const Role = database_1.default.define("Role", {
    role_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    title: {
        type: sequelize_1.DataTypes.STRING(300),
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true
    },
    deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: "roles",
});
exports.default = Role;
