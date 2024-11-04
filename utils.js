const { Url } = require('./model');

function makeID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

async function findOrigin(id) {
    try {
        const record = await Url.findByPk(id);
        return record ? record.url : null;
    } catch (err) {
        throw new Error(err.message);
    }
}

async function create(id, url) {
    try {
        await Url.create({ id, url });
        return id;
    } catch (err) {
        throw new Error(err.message);
    }
}

async function shortUrl(url) {
    while (true) {
        let newID = makeID(5);
        let originUrl = await findOrigin(newID);
        if (!originUrl) {
            await create(newID, url);
            return newID;
        }
    }
}

module.exports = {
    findOrigin,
    shortUrl
};
