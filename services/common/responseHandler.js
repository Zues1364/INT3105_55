export const successResponse = (res, data) => res.status(200).json(data);
export const errorResponse = (res, error, statusCode = 500) => res.status(statusCode).json({ error });