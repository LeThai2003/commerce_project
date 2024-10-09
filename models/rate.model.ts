import { DataTypes } from "sequelize";
import sequelize from "../configs/database";

const Rate = sequelize.define("Rate", {
    id_rate: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    star: {
        type: DataTypes.DECIMAL(1),
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: "products",
            key: "product_id"
        }
    },
    user_id : {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: "users",
            key: "user_id"
        }
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Đặt giá trị mặc định là false
    },
}, {
    timestamps: true,
    tableName: "rate"
});

export default Rate;