import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { JsonWebTokenError, sign, verify } from "jsonwebtoken";
import { join } from "path";
import { DeleteResult, QueryRunner } from "typeorm";
import RefreshToken from "../entities/RefreshToken";
import User from "../entities/User";
import { ServerErrors } from "../error";
import { RefreshTokenPayload } from "../types/jwtPayload";

const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY ? +process.env.REFRESH_TOKEN_EXPIRY : 60 * 60 * 24 * 7;
const REFRESH_TOKEN_PASSPHRASE = process.env.REFRESH_PASSPHRASE as string;
const PATH = process.env.NODE_ENV === "production" ? "/" : "/../../";
const REFRESH_PRIVATE_KEY = readFileSync(join(__dirname, PATH + "bin/refresh_private_key.pem", "utf-8"));
const REFRESH_PUBLIC_KEY = readFileSync(join(__dirname, PATH + "bin/refresh_public_key.pem", "utf-8"));
const AUDIENCE = process.env.AUDIENCE || "";

export default class RefreshTokenService {

    constructor() { }

    private async generateToken({
        jti,
        userId,
    }: {
        jti: string,
        userId: string,
    }): Promise<string> {
        return new Promise((resolve) => {
            const token = sign({
                uid: userId
            }, {
                key: REFRESH_PRIVATE_KEY,
                passphrase: REFRESH_TOKEN_PASSPHRASE,
            }, {
                expiresIn: REFRESH_TOKEN_EXPIRY * 1000,
                algorithm: "RS256",
                jwtid: jti,
                audience: AUDIENCE
            });
            resolve(token);
        });
    }

    async verifyToken(token: string): Promise<RefreshTokenPayload | ServerErrors> {
        return new Promise((resolve, reject) => {
            try {
                const tokenPayload = verify(token, {
                    key: REFRESH_PUBLIC_KEY,
                    passphrase: REFRESH_TOKEN_PASSPHRASE,
                }, {
                    algorithms: ["RS256"],
                });
                resolve(tokenPayload as RefreshTokenPayload);
            } catch (error) {
                if (error instanceof JsonWebTokenError)
                    reject(new ServerErrors("invalid_arguments", "Invalid access token."))
                reject(new ServerErrors("internal_error"));
            }
        });
    }

    async get(id: string, queryRunner: QueryRunner): Promise<RefreshToken | ServerErrors> {
        const refreshToken = await queryRunner.manager.findOne(RefreshToken, id);
        return (refreshToken && refreshToken.isValid()) ? refreshToken : new ServerErrors("not_found", "Refresh token not found");
    }

    async getWithUser(id: string, queryRunner: QueryRunner): Promise<RefreshToken | ServerErrors> {
        const refreshTokenWithUser = await queryRunner.manager.findOne(RefreshToken, {
            where: { id },
            relations: ['users']
        });
        return (refreshTokenWithUser && refreshTokenWithUser.isValid()) ? refreshTokenWithUser : new ServerErrors("not_found", "Refresh token not found");
    }

    async create({
        user
    }: {
        user: User | string
    }, queryRunner: QueryRunner): Promise<{ token: string; expires_in: number; } | ServerErrors> {
        const jti = randomUUID();
        const token = await this.generateToken({ jti, userId: typeof user === "string" ? user : user.id });
        await queryRunner.manager.create(RefreshToken, {
            id: jti,
            user,
            expiresAt: this.getTokenExpiry(),
        }).save();
        return {
            token,
            expires_in: REFRESH_TOKEN_EXPIRY
        };
    }

    delete(id: string, queryRunner: QueryRunner): Promise<DeleteResult> {
        return queryRunner.manager.softDelete(RefreshToken, { id });
    }

    async renew(id: string, queryRunner: QueryRunner): Promise<[RefreshToken, string | null] | ServerErrors> {
        const tokenDetails = await this.getWithUser(id, queryRunner);
        if (tokenDetails instanceof ServerErrors) return tokenDetails;
        let token: string | null = null;
        if (tokenDetails.needsRenewal()) {
            token = await this.generateToken({ jti: tokenDetails.id, userId: typeof tokenDetails.user === "string" ? tokenDetails.user : tokenDetails.user.id });
            tokenDetails.expiresAt = this.getTokenExpiry();
            await tokenDetails.save();
        }
        return [tokenDetails, token];
    }

    deleteAllWithUserId(userId: string, queryRunner: QueryRunner) {
        return queryRunner.manager.softDelete(RefreshToken, { user: userId });
    }

    private getTokenExpiry(): Date {
        const now = new Date();
        now.setSeconds(now.getSeconds() + REFRESH_TOKEN_EXPIRY);
        return now;
    }

}