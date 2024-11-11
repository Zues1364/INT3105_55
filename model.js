const { Sequelize, DataTypes } = require('sequelize');

// Khởi tạo Sequelize với SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '../db/app.db',
    pool : {
        max: 10, // Tối ưu nhất khi thử từ 5 - 100
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: console.log
});

sequelize.sync({ force: true })
    .then(() => {
        console.log("Database synchronized (reset).");
    })
    .catch(error => {
        console.error("Failed to synchronize database:", error);
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
