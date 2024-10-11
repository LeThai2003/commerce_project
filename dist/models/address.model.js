"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const Address = database_1.default.define("Address", {
    address_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    address_name: {
        type: sequelize_1.DataTypes.STRING(400),
        allowNull: false
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: "users",
            key: "user_id"
        }
    },
    default_address: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
}, {
    timestamps: true,
    tableName: "address"
});
exports.default = Address;
