import { DataTypes } from "sequelize";
import sequelize from "../configs/database";


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
    image_url: {
      type: DataTypes.TEXT('long'),
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
    }
 },{
    tableName: 'products',
    timestamps: true, // Tự động quản lý createdAt và updatedAt
  });

export default Product;