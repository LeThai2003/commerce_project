import { DataTypes, DATE } from "sequelize";
import sequelize from "../configs/database";

const Blog = sequelize.define("Blog", {
    blog_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title:{
        type: DataTypes.STRING(500),
        allowNull: false
    },
    content:{
        type: DataTypes.TEXT('long'),
        allowNull: true,
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
    tableName: "blogs"
});

export default Blog;