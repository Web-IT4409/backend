const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class UserFriend extends Model {
    static associate(models) {
        // Define associations with User model
        UserFriend.belongsTo(models.User, {
            foreignKey: 'user_id_1',
            as: 'user1'
        });
        UserFriend.belongsTo(models.User, {
            foreignKey: 'user_id_2',
            as: 'user2'
        });
    }
}

UserFriend.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id_1: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    user_id_2: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'UserFriend',
    tableName: 'user_friends',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id_1', 'user_id_2']
        }
    ],
    hooks: {
        beforeValidate: (userFriend) => {
            // Ensure user_id_1 is always less than user_id_2 for consistent querying
            if (userFriend.user_id_1 > userFriend.user_id_2) {
                [userFriend.user_id_1, userFriend.user_id_2] = [userFriend.user_id_2, userFriend.user_id_1];
            }
        }
    }
});

module.exports = UserFriend; 