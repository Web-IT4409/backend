const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class FriendRequest extends Model {
    static associate(models) {
        // Define associations with User model
        FriendRequest.belongsTo(models.User, {
            foreignKey: 'sender_id',
            as: 'sender'
        });
        FriendRequest.belongsTo(models.User, {
            foreignKey: 'receiver_id',
            as: 'receiver'
        });
    }
}

FriendRequest.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined', 'canceled'),
        defaultValue: 'pending'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'FriendRequest',
    tableName: 'friend_requests',
    indexes: [
        {
            unique: true,
            fields: ['sender_id', 'receiver_id'],
            where: {
                status: 'pending'
            }
        }
    ]
});

module.exports = FriendRequest; 