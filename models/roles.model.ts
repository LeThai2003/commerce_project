import { DataTypes } from "sequelize";
import sequelize from "../configs/database";

const Role = sequelize.define("Role", {
    role_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(300),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Đặt giá trị mặc định là false
    },
}, {
    timestamps: true,
    tableName: "roles",
});

export default Role;