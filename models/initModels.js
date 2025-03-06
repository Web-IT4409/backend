// models/initModels.js
const sequelize = require('../config/database');
const User = require('./user');
const PostModel = require('./post');

// Initialize Post model
const Post = PostModel(sequelize);

// Set up associations
const models = { User, Post };
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = models;