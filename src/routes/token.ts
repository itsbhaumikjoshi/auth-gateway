import { Router } from "express";
import { getErrorCodeStatus, ServerErrors } from "../error";
import RefreshTokenService from "../services/refreshToken.service";
import AccessTokenService from "../services/accessToken.service";
import { verifyRefreshToken } from "../helpers/middleware";
import User from "../entities/User";
import { getConnection } from "typeorm";
import { readFileSync } from "fs";
import { join } from "path";
import UserService from "../services/user.service";

const tokenRouter = Router();
const accessTokenService = new AccessTokenService();
const refreshTokenService = new RefreshTokenService();
const userService = new UserService();

/**
 * Methods: [POST, DELETE]
 * Description: routes for renewing and creating refresh and access tokens and deleting refresh tokens.
 */
tokenRouter.post("/", verifyRefreshToken, async (req, res, next) => {
    const grantType = req.body.grant_type;

    if (!["refresh_token"].includes(grantType))
        return res.status(400).json(new ServerErrors("invalid_arguments").toJson());

    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
        const renewedToken = await refreshTokenService.renew(res.locals.refresh_token.jti, queryRunner);
        if (renewedToken instanceof ServerErrors) {
            await queryRunner.commitTransaction();
            return res.status(getErrorCodeStatus(renewedToken.error.error_code)).json(renewedToken.toJson());
        }
        const [tokenDetails, token] = renewedToken;
        const accessToken = await accessTokenService.create({ user: tokenDetails.user as User, refreshToken: tokenDetails }, queryRunner);
        if (accessToken instanceof ServerErrors) {
            await queryRunner.commitTransaction();
            return res.status(getErrorCodeStatus(accessToken.error.error_code)).json(accessToken.toJson());
        }
        await queryRunner.commitTransaction();
        return res.status(200).json({
            access_token: accessToken.token,
            expires_in: accessToken.expires_in,
            refresh_token: token
        });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        next(error);
    } finally {
        await queryRunner.release();
    }

}).delete("/", verifyRefreshToken, async (req, res, next) => {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
        const token = res.locals.refresh_token.jti;
        await refreshTokenService.delete(token, queryRunner);
        await accessTokenService.deleteAllWithRefreshTokenId(token, queryRunner);
        await queryRunner.commitTransaction();
        res.status(200);
    } catch (error) {
        await queryRunner.rollbackTransaction();
        next(error);
    } finally {
        await queryRunner.release();
    }
});

/**
 * Methods: [GET]
 * Description: get public keys for access and refresh tokens to verify token authenticity.
 */
tokenRouter.get("/keys", async (req, res, next) => {
    try {
        const PATH = process.env.NODE_ENV === "production" ? "/" : "/../../";
        const accessTokenPublicKey = readFileSync(join(__dirname, PATH + "bin/access_public_key.pem", "utf-8"));
        const refreshTokenPublicKey = readFileSync(join(__dirname, PATH + "bin/refresh_public_key.pem", "utf-8"));
        return [{
            type: "access_token",
            key: accessTokenPublicKey,
        }, {
            type: "refresh_token",
            key: refreshTokenPublicKey
        }]
    } catch (error) {
        next(error);
    }
});

/**
 * Methods: [POST]
 * Description: user signsin using username as username or email and password and gets the auth tokens.
 */
tokenRouter.post("/signin", async (req, res, next) => {
    const { username, password } = req.body;
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
        const user = await userService.verifyCredentials({ username, password }, queryRunner);
        if (user instanceof ServerErrors) {
            await queryRunner.commitTransaction();
            return res.status(getErrorCodeStatus(user.error.error_code)).json(user.toJson());
        }
        const refresh_token = await refreshTokenService.create({ user }, queryRunner);
        if (refresh_token instanceof ServerErrors) {
            await queryRunner.commitTransaction();
            return res.status(getErrorCodeStatus(refresh_token.error.error_code)).json(refresh_token.toJson());
        }
        const access_token = await accessTokenService.create({ refreshToken: refresh_token.jti, user }, queryRunner);
        if (access_token instanceof ServerErrors) {
            await queryRunner.commitTransaction();
            return res.status(getErrorCodeStatus(access_token.error.error_code)).json(access_token.toJson());
        }
        await queryRunner.commitTransaction();
        return res.status(200).json({
            refresh_token,
            access_token: access_token.token,
            expires_in: access_token.expires_in,
        });
    } catch (error) {
        await queryRunner.rollbackTransaction();
        next(error);
    } finally {
        await queryRunner.release();
    }
});

export default tokenRouter;