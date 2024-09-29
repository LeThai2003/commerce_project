import { DataTypes } from "sequelize";
import sequelize from "../configs/database";


const CartItem = sequelize.define("OrderItem", {
    cart_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "carts",
        key: "cart_id"
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "product_id"
      }
    },
    ordered_quantity: {
        type: DataTypes.INTEGER,
    },
 },{
    tableName: 'cart_items',
    timestamps: true, // Tự động quản lý createdAt và updatedAt
  });


export default CartItem;