"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const Admin = database_1.default.define("Admin", {
    admin_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    first_name: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false
    },
    last_name: {
        type: sequelize_1.DataTypes.STRING(50),
    },
    image_url: {
        type: sequelize_1.DataTypes.STRING(500),
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(15),
    },
    email: {
        type: sequelize_1.DataTypes.STRING(60),
        allowNull: false,
        unique: true
    },
    credential_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "credentials",
            key: "credential_id"
        }
    },
    deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,
    tableName: "admins"
});
exports.default = Admin;
