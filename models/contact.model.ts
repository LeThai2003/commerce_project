import { DataTypes, DATE } from "sequelize";
import sequelize from "../configs/database";

const Contact = sequelize.define("Contact", {
    contact_id : {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    fullName : {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(400),
        allowNull: false,
    },
    content:{
        type: DataTypes.TEXT('long'),
        allowNull: true,
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,
    tableName: "contacts"
});

export default Contact;