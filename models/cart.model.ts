import { DataTypes } from "sequelize";
import sequelize from "../configs/database";

const Cart = sequelize.define("Cart", {
    cart_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "user_id",
        }
    }
}, {
    timestamps: true,
    tableName: "carts",
});

export default Cart;