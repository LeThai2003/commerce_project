import { DataTypes } from "sequelize";
import sequelize from "../configs/database";

const Credential = sequelize.define("Credential", {
    credential_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    role_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: "roles",
            key: "role_id"
        }
    },
    is_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true,
    tableName: "credentials"
});

export default Credential;