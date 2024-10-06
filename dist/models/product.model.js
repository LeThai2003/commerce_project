"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../configs/database"));
const slugify_1 = __importDefault(require("slugify"));
const Product = database_1.default.define("Product", {
    product_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "categories",
            key: "category_id"
        }
    },
    product_title: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    product_desc: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true,
    },
    image_url: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: true
    },
    price_unit: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    deleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: "active",
        allowNull: false,
    },
    slug: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    discount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'products',
    timestamps: true,
});
Product.beforeCreate((product) => {
    product["slug"] = (0, slugify_1.default)(`${product["product_title"]}-${Date.now()}`, {
        lower: true,
        strict: true,
    });
});
exports.default = Product;
