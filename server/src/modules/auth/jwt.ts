import {sign, verify} from "hono/jwt";
import { UnauthorizedError } from "../../lib/errors";
import type { AdminRole } from "../../contracts";

export type AuthTokenPayload = {
    sub: string;
    email: string;
    name: string;
    role: AdminRole;
    iat?: number;
    exp?: number;
};

export const signJwt = async (
    payload: Omit<AuthTokenPayload, "iat" | "exp">,
    secret: string,
): Promise<string> => {
    const now = Math.floor(Date.now() / 1000);
    return sign({...payload, iat: now, exp: now + 86400}, secret);
};

export const verifyJwt = async (
    token: string,
    secret: string,
): Promise<AuthTokenPayload> => {
    try {
        const payload = await verify(token, secret, "HS256");

        if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string" || !payload.role) {
            throw new UnauthorizedError("Invalid auth token");
        }

        return payload as unknown as AuthTokenPayload;
    } catch (err) {
        if (err instanceof UnauthorizedError) throw err;
        throw new UnauthorizedError("Invalid auth token");
    }
};
