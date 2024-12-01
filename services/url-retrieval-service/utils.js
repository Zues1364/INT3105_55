import { findOrigin } from '../common/db.js';

export async function retrieveUrl(id) {
    const url = await findOrigin(id);
    return url;
}
