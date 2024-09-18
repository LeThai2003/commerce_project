import { DataTypes } from "sequelize";
import sequelize from "../configs/database";

const VerificationToken = sequelize.define("Verification", {
    verification_token_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    credential_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "credentials",
            key: "credential_id"
        }
    },
    token_type: {
        type: DataTypes.STRING(30)
    },
    verif_token: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    expire_date: {
        type: DataTypes.DATE,
    }
},{
    timestamps: true,
    tableName: "verification_tokens"
});

export default VerificationToken;