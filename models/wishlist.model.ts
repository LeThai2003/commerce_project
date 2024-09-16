import { DataTypes } from "sequelize";
import sequelize from "../configs/database";

const Wishlist = sequelize.define("Wishlish", {
    user_id : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references:{
            model: "users",
            key: "user_id"
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references:{
            model: "products",
            key: "product_id"
        }
    },
    like_date:{
        type: DataTypes.DATE,
    }
}, {
    timestamps: true,
    tableName: "wishlist"
});

export default Wishlist;