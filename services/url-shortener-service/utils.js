import { findOrigin, create } from '../common/db.js';

function makeID(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}

export async function shortUrl(url) {
    while (true) {
        const newID = makeID(5);
        if (!await findOrigin(newID)) {
            await create(newID, url);
            return newID;
        }
    }
}
