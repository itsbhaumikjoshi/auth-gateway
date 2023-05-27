import { readFileSync } from "fs";
import { JsonWebTokenError, sign, verify } from "jsonwebtoken";
import { join } from "path";
import { DeleteResult, QueryRunner } from "typeorm";
import AccessToken from "../entities/AccessToken";
import RefreshToken from "../entities/RefreshToken";
import User from "../entities/User";
import { ServerErrors } from "../error";
import { AccessTokenPayload } from "../types/jwtPayload";

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY ? +process.env.ACCESS_TOKEN_EXPIRY : 3600;
const ACCESS_TOKEN_PASSPHRASE = process.env.ACCESS_PASSPHRASE as string;
const PATH = process.env.NODE_ENV === "production" ? "/" : "/../../";
const ACCESS_PRIVATE_KEY = readFileSync(join(__dirname, PATH + "bin/access_private_key.pem", "utf-8"));
const ACCESS_PUBLIC_KEY = readFileSync(join(__dirname, PATH + "bin/access_public_key.pem", "utf-8"));
const AUDIENCE = process.env.AUDIENCE || "";

export default class AccessTokenService {

    constructor() { }

    private generateToken({ jti, user: { email, username, name, scope, id } }: { jti: string; user: User; }): Promise<string> {
        return new Promise((resolve) => {
            const token = sign({
                email,
                scope,
                name,
                uid: id,
            }, {
                key: ACCESS_PRIVATE_KEY,
                passphrase: ACCESS_TOKEN_PASSPHRASE,
            }, {
                expiresIn: ACCESS_TOKEN_EXPIRY * 1000,
                algorithm: "RS256",
                jwtid: jti,
                subject: username,
                audience: AUDIENCE,
            });
            resolve(token);
        });
    }

    async verifyToken(token: string): Promise<AccessTokenPayload | ServerErrors> {
        return new Promise((resolve, reject) => {
            try {
                const tokenPayload = verify(token, {
                    key: ACCESS_PUBLIC_KEY,
                    passphrase: ACCESS_TOKEN_PASSPHRASE,
                }, {
                    algorithms: ["RS256"],
                });
                resolve(tokenPayload as AccessTokenPayload);
            } catch (error) {
                if (error instanceof JsonWebTokenError)
                    reject(new ServerErrors("invalid_arguments", "Invalid access token."))
                reject(new ServerErrors("internal_error"));
            }
        });
    }

    async get(id: string): Promise<AccessToken | ServerErrors> {
        const token = await AccessToken.findOne(id);
        return token && token.isValid() ? token : new ServerErrors("not_found", "Access token not found.");
    }

    async create(
        {
            user,
            refreshToken,
        }: {
            user: User,
            refreshToken: RefreshToken | string,
        }, queryRunner: QueryRunner
    ): Promise<{ token: string; expires_in: number; } | ServerErrors> {
        const jti = crypto.randomUUID();
        const token = await this.generateToken({ jti, user });
        await queryRunner.manager.create(AccessToken, {
            id: jti,
            user,
            refreshToken,
            expiresAt: this.getTokenExpiry()
        }).save();
        return {
            token,
            expires_in: ACCESS_TOKEN_EXPIRY
        }
    }

    deleteAllWithRefreshTokenId(rfId: string, queryRunner: QueryRunner): Promise<DeleteResult> {
        return queryRunner.manager.softDelete(AccessToken, { refreshToken: rfId });
    }

    deleteAllWithUserId(userId: string, queryRunner: QueryRunner): Promise<DeleteResult> {
        return queryRunner.manager.softDelete(AccessToken, { user: userId });
    }

    getTokenExpiry() {
        const now = new Date();
        now.setSeconds(now.getSeconds() + ACCESS_TOKEN_EXPIRY);
        return now;
    }

}