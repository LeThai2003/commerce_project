import { DataTypes } from "sequelize";
import sequelize from "../configs/database";
import slugify from "slugify";


const Product = sequelize.define("Product", {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
          model: "categories",
          key: "category_id"
        }
    },
    product_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    product_desc: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    image_url: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    price_unit: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Đặt giá trị mặc định là false
    },
    status:{
      type: DataTypes.STRING,
      defaultValue: "active",
      allowNull: false,
    },
    slug:{
      type: DataTypes.STRING,
      allowNull: true
    },
    discount:{
      type: DataTypes.INTEGER,
      allowNull: true
    }
 },{
    tableName: 'products',
    timestamps: true, // Tự động quản lý createdAt và updatedAt
  });


  Product.beforeCreate((product) => {
    product["slug"] = slugify(`${product["product_title"]}-${Date.now()}`, {
      lower: true,
      strict: true,
    });
  });

export default Product;