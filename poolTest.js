import { sequelize, Url } from './model.js'; // Import sequelize và model Url từ model.js

async function testConnectionPool() {
    await sequelize.sync({ force: true }); // Đồng bộ cơ sở dữ liệu

    // Tạo một mảng các promise để thực hiện nhiều truy vấn đồng thời
    const promises = [];
    for (let i = 0; i < 3000; i++) { // Thực hiện 20 truy vấn đồng thời
        promises.push(
            Url.create({ id: `id${i}`, url: `https://example${i}.com` })
        );
    }

    // Đo thời gian thực hiện tất cả các truy vấn
    console.time('Connection Pool Test');
    await Promise.all(promises); // Thực hiện tất cả các truy vấn đồng thời
    console.timeEnd('Connection Pool Test');
    
    console.log("All queries executed.");
}

testConnectionPool()
    .then(() => console.log("Test completed"))
    .catch(error => console.error("Test failed", error))
    .finally(() => sequelize.close()); // Đóng kết nối Sequelize sau khi hoàn thành
