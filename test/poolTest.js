import { sequelize, Url } from '../services/common/db.js';

async function testConnectionPool() {
    console.log('Starting connection pool test...');
    await sequelize.sync({ force: true }); // Reset the database

    const promises = [];
    const totalQueries = 3000; // Number of queries to test
    for (let i = 0; i < totalQueries; i++) {
        promises.push(Url.create({ id: `id${i}`, url: `https://example${i}.com` }));
    }

    console.time('Connection Pool Test');
    await Promise.all(promises); // Execute all queries concurrently
    console.timeEnd('Connection Pool Test');

    console.log(`Executed ${totalQueries} queries.`);
}

testConnectionPool()
    .then(() => console.log('Connection pool test completed successfully.'))
    .catch((error) => console.error('Connection pool test failed:', error))
    .finally(() => sequelize.close()); // Close Sequelize connection
