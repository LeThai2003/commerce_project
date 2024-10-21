import { DataTypes } from "sequelize";
import sequelize from "../configs/database";

const Admin = sequelize.define("Admin", {
    admin_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    first_name: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(50),
    },
    image_url: {
        type: DataTypes.STRING(500),
    },
    phone: {
        type: DataTypes.STRING(15),
    },
    email: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true
    },
    credential_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "credentials",
            key: "credential_id"
        }
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Đặt giá trị mặc định là false
    }
}, {
    timestamps: true,
    tableName: "admins"
})

export default Admin