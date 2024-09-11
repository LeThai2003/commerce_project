import { DataTypes } from "sequelize";
import sequelize from "../configs/database";


const Payment = sequelize.define("Payment", {
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_payed: {
        type: DataTypes.INTEGER,
    },
    payment_status: {
        type: DataTypes.STRING(50),
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
    tableName: 'payments',
    timestamps: true, // Tự động quản lý createdAt và updatedAt
  });


export default Payment;