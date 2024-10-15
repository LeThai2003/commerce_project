import { DataTypes } from "sequelize";
import sequelize from "../configs/database";


const Category = sequelize.define("Category", {
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    parent_category_id: {   // parent
        type: DataTypes.INTEGER,
        references:{
          model: "categories",
          key: "category_id"
        }
    },
    category_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status:{
      type: DataTypes.STRING,
      defaultValue: "active",
      allowNull: false,
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Đặt giá trị mặc định là false
    }
 },{
    tableName: 'categories',
    timestamps: true, // Tự động quản lý createdAt và updatedAt
  });

export default Category;