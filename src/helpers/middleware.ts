import { NextFunction, Request, Response } from "express";
import { getErrorCodeStatus, ServerErrors } from "../error";
import AccessTokenService from "../services/accessToken.service";
import RefreshTokenService from "../services/refreshToken.service";

const accessTokenService = new AccessTokenService();
const refreshTokenService = new RefreshTokenService();

export const verifyAccessToken = (scope: string) => async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.code)
        return next();
    if (!req.body.access_token)
        return res.status(401).json(new ServerErrors("unauthenticated", "access_token not found").toJson());
    const token = await accessTokenService.verifyToken(req.body.access_token);
    if (token instanceof ServerErrors)
        return res.status(getErrorCodeStatus(token.error.error_code)).json(token.toJson());
    if (!token.scope.split(" ").includes(scope))
        return res.status(403).json(new ServerErrors("forbidden").toJson());
    res.locals = {
        ...res.locals,
        ...token
    }
    return next();
};

export const verifyRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.refresh_token)
        return res.status(401).json(new ServerErrors("unauthenticated", "refresh_token not found").toJson());
    const token = await refreshTokenService.verifyToken(req.body.refresh_token);
    if (token instanceof ServerErrors)
        return res.status(getErrorCodeStatus(token.error.error_code)).json(token.toJson());
    res.locals.refresh_token = token;
    return next();
}