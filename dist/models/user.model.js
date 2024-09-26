"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const User = database_1.default.define("User", {
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    credential_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "credentials",
            key: "credential_id"
        }
    },
    first_name: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
    },
    last_name: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    image_url: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(60),
        allowNull: false,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(15),
        allowNull: false,
    },
    deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'users',
    timestamps: true,
});
exports.default = User;
