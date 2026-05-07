import { ConflictError, ForbiddenError, UnauthorizedError } from "../../lib/errors";
import type { AdminRole, LoginResultDto } from "../../contracts";
import argon2 from "argon2";
import { toAdminAccountResponse } from "./auth.mapper";
import type { AuthRepository } from "./auth.repository";
import type { CreateAdminInput, LoginInput } from "./auth.schema";
import { signJwt } from "./jwt";
import type {AuthVariables} from "@server/modules/auth/auth.middleware";

const LOGIN_TTL_SECONDS = 24 * 60 * 60;

export class AuthService {
    private superadminEnsured = false;

    constructor(
        private repository: AuthRepository,
        private options: {
            jwtSecret: string;
            superadminEmail: string;
            superadminPassword: string;
        },
    ) {
    }

    public ensureSuperadmin = async () => {
        if (this.superadminEnsured) {
            return;
        }

        const existing = await this.repository.findSuperadmin();
        if (existing) {
            this.superadminEnsured = true;
            return;
        }

        const passwordHash = await argon2.hash(this.options.superadminPassword);
        try {
            await this.repository.create({
                email: this.options.superadminEmail.toLowerCase(),
                name: "Superadmin",
                passwordHash: passwordHash,
                role: "SUPERADMIN",
            });
        } catch (error) {
            const dbError = error as { code?: string };
            if (dbError.code !== "ER_DUP_ENTRY") {
                throw error;
            }
        }

        this.superadminEnsured = true;
    };

    public login = async (input: LoginInput): Promise<LoginResultDto> => {
        await this.ensureSuperadmin();

        const account = await this.repository.findByEmail(input.email);
        if (!account || !account.isActive) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const validPassword = await argon2.verify(account.passwordHash, input.password);
        if (!validPassword) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const now = Math.floor(Date.now() / 1000);
        const expiresAt = new Date((now + LOGIN_TTL_SECONDS) * 1000);
        const token = await signJwt({
            sub: account.id,
            email: account.email,
            name: account.name,
            role: account.role,
        }, this.options.jwtSecret);

        return {
            token: token,
            expiresAt: expiresAt,
            admin: toAdminAccountResponse(account),
        };
    };

    public getAccountById = async (id: string) => {
        const account = await this.repository.findActiveById(id);
        if (!account) {
            throw new UnauthorizedError("Account not found");
        }

        return account;
    };

    public createAdmin = async (actor: AuthVariables["admin"], input: CreateAdminInput) => {
        this.assertRole(actor, "SUPERADMIN");

        const existing = await this.repository.findByEmail(input.email);
        if (existing) {
            throw new ConflictError("Admin account already exists");
        }

        const passwordHash = await argon2.hash(input.password);
        const account = await this.repository.create({
            email: input.email,
            name: input.name,
            passwordHash: passwordHash,
            role: "ADMIN",
        });

        if (!account) {
            throw new ConflictError("Failed to create admin account");
        }

        return account;
    };

    private assertRole(account: AuthVariables["admin"], role: AdminRole) {
        if (account.role !== role) {
            throw new ForbiddenError(`${role} access required`);
        }
    }
}
