import { findOrigin } from '../common/db.js';

export async function retrieveUrl(id) {
    const url = await findOrigin(id);
    if (!url) throw new Error('URL not found');
    return url;
}
