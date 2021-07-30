import { Router } from "express";
import { v4 } from 'uuid';
import User from "../entities/User";
import Session from "../entities/Session";
import { generateAccessTokens, generateRefreshTokens } from "../helpers/generateToken";
import { setSessionExpiration, isSessionValid } from "../helpers/tokenExpiration";
import { isIdValid } from "../helpers/validation";

const sessionRouter = Router();

/**
 * Method - POST
 * Description - This route creates the session and Logs in the user.
 */
sessionRouter.post("/", async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "Username or Password is missing" });
    try {
        const user = await User.findOne({ where: { username }, select: ['password', 'id'] });
        if (!user)
            return res.status(404).json({ message: `user with username ${username} does not exists` });
        if(!user.isVerified)
            return res.status(403).json({ message: `Your account has not been verified yet, please confirm yoyur account.` });
        const isPasswordValid = await user.validatePassword(password);
        if (isPasswordValid) {
            const sessionId = v4();
            const refereshToken = generateRefreshTokens({ userId: user.id, sessionId });
            const accessToken = generateAccessTokens({ sessionId });
            await Session.create({
                id: sessionId,
                token: refereshToken,
                userId: user.id,
                accessTokens: 1,
                expiresAt: setSessionExpiration(30).toUTCString()
            }).save();
            return res.status(200).json({ refereshToken, accessToken });
        }
        return res.status(401).json({ message: "Incorrect credentials" });
    } catch (error) {
        next(error);
    }
});

/**
 * Method - [GET, DELETE]
 * Description - Get session info & log the user out
 */
sessionRouter.route("/:sessionId")
    .get(async (req, res, next) => {
        const { sessionId } = req.params;
        if (isIdValid(sessionId))
            return res.status(400).json({ message: "Invalid Session ID" });
        try {
            const session = await Session.findOne({ where: { id: sessionId } });
            if (session && await isSessionValid(session))
                return res.status(200).json({ session });
            return res.status(404).json({ message: "User not found" });
        } catch (error) {
            next(error);
        }
    })
    .delete(async (req, res, next) => {
        const { sessionId } = req.params;
        if (isIdValid(sessionId))
            return res.status(400).json({ message: "Invalid Session ID" });
        try {
            const session = await Session.findOne({ where: { id: sessionId } });
            await session?.softRemove();
            res.status(200).json({ message: "Session removed successfully" });
        } catch (error) {
            next(error);
        }
    });

/**
* Method - GET
* Description - Validates the session. However, not returning the data back.
*/
sessionRouter.get("/validate-session/:sessionId", async (req, res, next) => {
    const { sessionId } = req.params;
    if (isIdValid(sessionId))
        return res.status(400).json({ message: "Invalid Session ID" });
    try {
        const session = await Session.findOne({ where: { id: sessionId } });
        if (session && await isSessionValid(session))
            return res.status(200);
        return res.status(404);
    } catch (error) {
        next(error);
    }
});

/**
* Method - POST
* Description - Gets the new refresh token, revoking the old one.
*/
sessionRouter.post("/get-refresh-token", async (req, res, next) => {
    const { sessionId, userId } = req.body;
    if (isIdValid(sessionId))
        return res.status(400).json({ message: "Invalid Session ID" });
    if (isIdValid(userId))
        return res.status(400).json({ message: "Invalid User ID" });
    try {
        const session = await Session.findOne({ where: { id: sessionId } });
        if (session && session.userId === userId && await isSessionValid(session)) {
            await session.softRemove();
            const newSessionId = v4();
            const refereshToken = generateRefreshTokens({ userId: userId, sessionId: newSessionId });
            const accessToken = generateAccessTokens({ sessionId: newSessionId });
            await Session.create({
                id: newSessionId,
                token: refereshToken,
                userId: userId,
                accessTokens: 1,
                expiresAt: setSessionExpiration(30).toUTCString()
            }).save();
            return res.status(200).json({ refereshToken, accessToken });
        }
        return res.status(404).json({ message: "Session does not exists" });
    } catch (error) {
        next(error);
    }
});

/**
* Method - POST
* Description - Get new access token, given the refresh token.
*/
sessionRouter.post("/get-access-token", async (req, res, next) => {
    const { sessionId, userId } = req.body;
    if (isIdValid(sessionId))
        return res.status(400).json({ message: "Invalid Session ID" });
    if (isIdValid(userId))
        return res.status(400).json({ message: "Invalid User ID" });
    try {
        const session = await Session.findOne({ where: { id: sessionId } });
        if (session && session.userId === userId && await isSessionValid(session)) {
            const accessToken = generateAccessTokens({ sessionId });
            session.accessTokens = session.accessTokens++;
            await session.save();
            return res.status(200).json({ accessToken });
        }
        return res.status(404).json({ message: "Session does not exists" });
    } catch (error) {
        next(error);
    }
});

export default sessionRouter;