import { DataTypes } from "sequelize";
import sequelize from "../configs/database";


const Order = sequelize.define("Order", {
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    card_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    order_desc: {
      type: DataTypes.STRING(300),
    },
    order_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    order_fee: {
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
    tableName: 'orders',
    timestamps: true, // Tự động quản lý createdAt và updatedAt
  });


export default Order;