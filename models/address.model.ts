import { DataTypes } from "sequelize";
import sequelize from "../configs/database";

const Address = sequelize.define("Address", {
    address_id : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    address_name: {
        type: DataTypes.STRING(400),
        allowNull: false
    },
    user_id : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references:{
            model: "users",
            key: "user_id"
        }
    },
    default_address: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
}, {
    timestamps: true,
    tableName: "address"
})

export default Address