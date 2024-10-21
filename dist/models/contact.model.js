"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const Contact = database_1.default.define("Contact", {
    contact_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    fullName: {
        type: sequelize_1.DataTypes.STRING(60),
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    title: {
        type: sequelize_1.DataTypes.STRING(400),
        allowNull: false,
    },
    content: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true,
    },
    deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,
    tableName: "contacts"
});
exports.default = Contact;
