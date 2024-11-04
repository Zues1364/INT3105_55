const { Sequelize, DataTypes } = require('sequelize');

// Khởi tạo Sequelize với SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '../db/app.db'
});

// Định nghĩa mô hình cho URL
const Url = sequelize.define('Url', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: false,
    tableName: 'data'
});

// Tạo bảng nếu chưa tồn tại
sequelize.sync();

module.exports = {
    Url,
    sequelize
};
