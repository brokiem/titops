import type {Context} from 'hono'
import type {ContentfulStatusCode} from 'hono/utils/http-status'
import type { ApiEnvelope } from '../contracts'

/**
 * Generic JSON response
 */
export const json = <T>(
    c: Context,
    data: T,
    status: ContentfulStatusCode = 200
) => {
    return c.json(data, status);
}

/**
 * 200 OK
 */
export const ok = <T>(c: Context, data: T) => {
    return json<ApiEnvelope<T>>(c, {data}, 200);
}

/**
 * 201 Created
 */
export const created = <T>(c: Context, data: T) => {
    return json<ApiEnvelope<T>>(c, {data}, 201);
}

/**
 * 204 No Content
 */
export const noContent = (c: Context) => {
    return c.body(null, 204);
}
