import { DataTypes } from "sequelize";
import sequelize from "../configs/database";


const OrderItem = sequelize.define("OrderItem", {
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "orders",
        key: "order_id"
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "products",
        key: "product_id"
      }
    },
    ordered_quantity: {
        type: DataTypes.INTEGER,
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Đặt giá trị mặc định là false
    }
 },{
    tableName: 'order_items',
    timestamps: true, // Tự động quản lý createdAt và updatedAt
  });


export default OrderItem;