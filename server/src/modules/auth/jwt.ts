import { sign, verify } from "jsonwebtoken";
import { UnauthorizedError } from "../../lib/errors";
import type { AdminRole } from "../../contracts";

export type AuthTokenPayload = {
    sub: string;
    email: string;
    role: AdminRole;
    iat?: number;
    exp?: number;
};

export const signJwt = (payload: Omit<AuthTokenPayload, "iat" | "exp">, secret: string) => {
    return sign(payload, secret, { algorithm: "HS256", expiresIn: "24h" });
};

export const verifyJwt = (token: string, secret: string): AuthTokenPayload => {
    try {
        const payload = verify(token, secret, { algorithms: ["HS256"] });
        if (typeof payload === "string") {
            throw new UnauthorizedError("Invalid auth token");
        }

        if (!payload.sub || typeof payload.email !== "string" || !payload.role || !payload.exp) {
            throw new UnauthorizedError("Invalid auth token");
        }

        return payload as AuthTokenPayload;
    } catch {
        throw new UnauthorizedError("Invalid auth token");
    }
};
