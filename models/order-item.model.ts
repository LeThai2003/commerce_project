import { DataTypes } from "sequelize";
import sequelize from "../configs/database";


const OrderItem = sequelize.define("OrderItem", {
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ordered_quantity: {
        type: DataTypes.INTEGER,
    },
    created_at: {
        type: DataTypes.DATE,
    },
    updated_at: {
        type: DataTypes.DATE,
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