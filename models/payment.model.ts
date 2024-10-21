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
      allowNull: false,
      references: {
        model: "orders",
        key: "order_id"
      }
    },
    is_payed: {
        type: DataTypes.INTEGER,
    },
    method_payment:{
      type: DataTypes.STRING(20),
      defaultValue: "cash"
    },
    payment_status: {
        type: DataTypes.INTEGER,
        references: {
          model: "paymentstatus",
          key: "id"
        }
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