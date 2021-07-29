import { Router } from "express";
import { v4 } from 'uuid';
import User from "../entities/User";
import Session from "../entities/Session";
import { generateAccessTokens, generateRefreshTokens } from "../helpers/generateToken";
import { setSessionExpiration, isSessionValid } from "../helpers/tokenExpiration";

const sessionRouter = Router();

sessionRouter.post("/", async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "Username or Password is missing" });
    try {
        const user = await User.findOne({ where: { username }, select: ['password', 'id'] });
        if (!user)
            return res.status(404).json({ message: `user with username ${username} does not exists` });
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

sessionRouter.route("/:sessionId")
    .get(async (req, res, next) => {
        const { sessionId } = req.params;
        if (!sessionId || sessionId.length !== 36)
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
        if (!sessionId || sessionId.length !== 36)
            return res.status(400).json({ message: "Invalid Session ID" });
        try {
            await Session.delete({ id: sessionId });
            res.status(200).json({ message: "Session removed successfully" });
        } catch (error) {
            next(error);
        }
    });

sessionRouter.get("/validate-session/:sessionId", async (req, res, next) => {
    const { sessionId } = req.params;
    if (!sessionId || sessionId.length !== 36)
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

sessionRouter.post("/get-refresh-token", async (req, res, next) => {
    const { sessionId, userId } = req.body;
    if (!sessionId || sessionId.length !== 36)
        return res.status(400).json({ message: "Invalid Session ID" });
    if (!userId || userId.length !== 36)
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

sessionRouter.post("/get-access-token", async (req, res, next) => {
    const { sessionId, userId } = req.body;
    if (!sessionId || sessionId.length !== 36)
        return res.status(400).json({ message: "Invalid Session ID" });
    if (!userId || userId.length !== 36)
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