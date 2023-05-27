import { Router } from "express";
import { getConnection } from "typeorm";
import RefreshTokenService from "../services/refreshToken.service";
import AccessTokenService from "../services/accessToken.service";
import { verifyAccessToken } from "../helpers/middleware";
import { getErrorCodeStatus, ServerErrors } from "../error";
import UserService from "../services/user.service";
import User from "../entities/User";

const userRouter = Router();
const accessTokenService = new AccessTokenService();
const refreshTokenService = new RefreshTokenService();
const userService = new UserService();

/**
 * Methods: [GET, POST, PUT, DELETE]
 * Description: routes to get user info, register user, update user info, delete user account
 */
userRouter.route("/")
    .get(verifyAccessToken("profile"), async (req, res, next) => {
        try {
            const user = await userService.get(res.locals.uid);
            if (user instanceof ServerErrors)
                return res.status(getErrorCodeStatus(user.error.error_code)).json(user.toJson());
            const { email, username, name, id } = user;
            res.status(200).json({
                email,
                username,
                name,
                id,
            });
        } catch (error) {
            next(error);
        }
    })
    .post(async (req, res, next) => {
        const { username, password, email, first_name, last_name, scope = "" } = req.body;
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            const user = await userService.create({
                firstName: first_name,
                lastName: last_name,
                username,
                email,
                password,
                scope
            }, queryRunner);
            if (user instanceof ServerErrors) {
                await queryRunner.commitTransaction();
                return res.status(getErrorCodeStatus(user.error.error_code)).json(user.toJson());
            }
            const codeDetails = await userService.generateCode({ id: user.id }, queryRunner);
            await queryRunner.commitTransaction();
            return res.status(200).json(codeDetails);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            next(error);
        } finally {
            await queryRunner.release();
        }
    })
    .put(verifyAccessToken("profile"), async (req, res, next) => {
        const { username, first_name, last_name } = req.body;
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            const result = await userService.updateUserDetails({
                id: res.locals.uid,
                username,
                firstName: first_name,
                lastName: last_name,
            }, queryRunner);
            if (result instanceof ServerErrors) {
                await queryRunner.commitTransaction();
                return res.status(getErrorCodeStatus(result.error.error_code)).json(result.toJson());
            }
            await queryRunner.commitTransaction();
            res.status(200);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            next(error);
        } finally {
            await queryRunner.release();
        }
    })
    .delete(verifyAccessToken("profile"), async (_, res, next) => {
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            await Promise.all([
                userService.delete(res.locals.uid, queryRunner),
                refreshTokenService.deleteAllWithUserId(res.locals.uid, queryRunner),
                accessTokenService.deleteAllWithUserId(res.locals.uid, queryRunner),
            ]);
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
 * Methods: [POST]
 * Description: verify the user account given the code and return the auth tokens.
 */
userRouter.post("/verify-user", async (req, res, next) => {
    const { code } = req.body;
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
        const user = await userService.verifyUserAccount(code, queryRunner);
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

/**
 * Methods: [POST]
 * Description: create the forgot password code which is meant to be sent to user via email server.
 */
userRouter.post("/forgot-password", async (req, res, next) => {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
        const result = await userService.generateCode({ id: res.locals.uid }, queryRunner);
        if (result instanceof ServerErrors) {
            await queryRunner.commitTransaction();
            return res.status(getErrorCodeStatus(result.error.error_code)).json(result.toJson());
        }
        await queryRunner.commitTransaction();
        return res.status(200).json(result);
    } catch (error) {
        await queryRunner.rollbackTransaction();
        next(error);
    } finally {
        await queryRunner.release();
    }
});

/**
 * Methods: [POST]
 * Description: changes the password given the forgotten code or the old password
 */
userRouter.post("/change-password", verifyAccessToken("profile"), async (req, res, next) => {
    const { code, old_password, password, } = req.body;
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
        const result = await userService.changePassword({
            password,
            code,
            id: res.locals.uid,
            oldPassword: old_password
        }, queryRunner);
        if (result instanceof ServerErrors) {
            await queryRunner.commitTransaction();
            return res.status(getErrorCodeStatus(result.error.error_code)).json(result.toJson());
        }
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
 * Methods: [POST]
 * Description: create code to verify new email address to update.
 */
userRouter.post("/change-email-request", verifyAccessToken("email"), async (req, res, next) => {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
        const result = await userService.generateCode({ id: res.locals.uid }, queryRunner);
        if (result instanceof ServerErrors) {
            await queryRunner.commitTransaction();
            return res.status(getErrorCodeStatus(result.error.error_code)).json(result.toJson());
        }
        await queryRunner.commitTransaction();
        return res.status(200).json(result);
    } catch (error) {
        await queryRunner.rollbackTransaction();
        next(error);
    } finally {
        await queryRunner.release();
    }
});

/**
 * Methods: [POST]
 * Description: update the email to new email address.
 */
userRouter.post("/change-email", verifyAccessToken("email"), async (req, res, next) => {
    const { email, code } = req.body;
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
        const result = await userService.updateEmail({ code, email }, queryRunner);
        if (result instanceof ServerErrors) {
            await queryRunner.commitTransaction();
            return res.status(getErrorCodeStatus(result.error.error_code)).json(result.toJson());
        }
        await queryRunner.commitTransaction();
        return res.status(200);
    } catch (error) {
        await queryRunner.rollbackTransaction();
        next(error);
    } finally {
        await queryRunner.release();
    }
});

export default userRouter;