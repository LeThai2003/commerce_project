"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const VerificationToken = database_1.default.define("Verification", {
    verification_token_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    credential_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "credentials",
            key: "credential_id"
        }
    },
    token_type: {
        type: sequelize_1.DataTypes.STRING(30)
    },
    verif_token: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    expire_date: {
        type: sequelize_1.DataTypes.DATE,
    }
}, {
    timestamps: true,
    tableName: "verification_tokens"
});
exports.default = VerificationToken;
