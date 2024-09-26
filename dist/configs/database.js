"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    dialect: 'mysql'
});
sequelize.authenticate().then(() => {
    console.log('Kết nối databse thành công!');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});
exports.default = sequelize;
