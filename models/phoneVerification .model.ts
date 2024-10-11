import { DataTypes } from "sequelize";
import sequelize from "../configs/database";


const PhoneVerification  = sequelize.define("PhoneVerification ", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    verify_phone_number:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
 },{
    tableName: 'phone_verification',
    timestamps: false, // Tự động quản lý createdAt và updatedAt
  });


export default PhoneVerification ;