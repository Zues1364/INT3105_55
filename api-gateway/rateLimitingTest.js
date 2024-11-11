const axios = require('axios');

const URL_Short= 'http://localhost:3000/shorten'; // Thay thế URL bằng route bạn muốn kiểm thử
const URL_Get='http://localhost:3000/retrieve/VtDGS'
const totalRequests = 120; // Số lượng yêu cầu bạn muốn gửi
let successCount = 0;
let errorCount = 0;

async function sendRequest() {
    try {
        //await axios.post(URL_Short, { url: "https://example.com" });
        await axios.get(URL_Get)
        successCount++;
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error("Rate limit exceeded!");
            errorCount++;
        } else {
            console.error("Other error:", error.message);
        }
    }
}

async function runTest() {
    const promises = [];
    for (let i = 0; i < totalRequests; i++) {
        promises.push(sendRequest());
    }

    await Promise.all(promises);

    console.log(`Success requests: ${successCount}`);
    console.log(`Rate-limited requests: ${errorCount}`);
}

runTest();
