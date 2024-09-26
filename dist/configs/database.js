"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const mysql2_1 = __importDefault(require("mysql2"));
const sequelize = new sequelize_1.Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    dialect: 'mysql',
    dialectModule: mysql2_1.default,
});
sequelize.authenticate().then(() => {
    console.log('Kết nối databse thành công!');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});
exports.default = sequelize;
