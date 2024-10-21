import { DataTypes } from "sequelize";
import sequelize from "../configs/database";


const PaymentStatus = sequelize.define("PaymentStatus", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    status: {
        type: DataTypes.STRING(30),
    }
 },{
    tableName: 'paymentStatus',
    timestamps: false, // Tự động quản lý createdAt và updatedAt
  });


export default PaymentStatus;