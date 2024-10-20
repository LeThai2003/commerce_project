import { DataTypes, DATE } from "sequelize";
import sequelize from "../configs/database";

const Comment = sequelize.define("Comment", {
    comment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    user_id : {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: "users",
            key: "user_id"
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: "products",
            key: "product_id"
        }
    },
    parent_comment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: "comment",
            key: "comment_id"
        }
    },
    content:{
        type: DataTypes.TEXT('long'),
        allowNull: true,
    },
    star: {
        type: DataTypes.DECIMAL(1),
    },
    image_url: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,
    tableName: "comment"
});

export default Comment;