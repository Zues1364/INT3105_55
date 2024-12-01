import { create, getNextCounter } from '../common/db.js';

function encodeBase62(number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let encoded = '';
    while (number > 0) {
        encoded = characters[number % 62] + encoded;
        number = Math.floor(number / 62);
    }
    return encoded || '0';
}

function padToLength(str, length) {
    return str.padStart(length, '0');
}

export async function shortUrl(url) {
    const counter = await getNextCounter();
    const rawID = encodeBase62(counter);
    const shortID = padToLength(rawID, 6); // Ensure ID is always 6 characters long
    await create(shortID, url); // Save the mapping to MongoDB and Redis
    return shortID;
}
