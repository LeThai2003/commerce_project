import { DataTypes } from "sequelize";
import sequelize from "../configs/database";


const ForgotPassword  = sequelize.define("ForgotPassword ", {
    forgot_password_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    verify_otp:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
 },{
    tableName: 'forgotpasswords',
    timestamps: false, // Tự động quản lý createdAt và updatedAt
  });


export default ForgotPassword ;