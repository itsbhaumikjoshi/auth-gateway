import { Router } from "express";
import { v4 } from 'uuid';
import User from "../entities/User";
import Session from "../entities/Session";
import { generateRefreshTokens } from "../helpers/generateToken";

const sessionRouter = Router();

sessionRouter.post("/", async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "Username or Password is missing" });
    try {
        const user = await User.findOne({ where: { username }, select: ['username', 'password', 'id'] });
        if (!user)
            return res.status(404).json({ message: `user with username ${username} does not exists` });
        const isPasswordValid = await user.validatePassword(password);
        if (isPasswordValid) {
            const sessionId = v4();
            const token = generateRefreshTokens({ userId: user.id, sessionId });
            await Session.create({
                id: sessionId,
                token,
                userId: user.id,
                expiresAt: new Date(Date.now()).toUTCString()
            }).save();
            return res.status(200).json({ token });
        }
    } catch (error) {
        next(error);
    }
});

sessionRouter.route("/:sessionId")
    .get(async (req, res, next) => {
        const { sessionId } = req.params;
        if (!sessionId)
            return res.status(400).json({ message: "Session Id is missing" });
        try {
            const session = await Session.findOne({ where: { id: sessionId } });
            if (session)
                return res.status(200).json({ session });
            return res.status(404).json({ message: "User not found" });
        } catch (error) {
            next(error);
        }
    })
    .delete(async (req, res, next) => {
        const { sessionId } = req.params;
        if (!sessionId)
            return res.status(400).json({ message: "Session Id is missing" });
        try {
            await Session.delete({ id: sessionId });
            res.status(200).json({ message: "Logged out successfully" });
        } catch (error) {
            next(error);
        }
    });

sessionRouter.get("/validate-session/:sessionId", async (req, res, next) => {
    const { sessionId } = req.params;
    if (!sessionId)
        return res.status(400).json({ message: "Session Id is missing" });
    try {
        const session = await Session.findOne({ where: { id: sessionId } });
        if (session)
            return res.status(200);
        return res.status(404);
    } catch (error) {
        next(error);
    }
});

sessionRouter.post("/replace-session", async (req, res, next) => {
    const { sessionId, userId } = req.body;
    try {
        await Session.delete({ id: sessionId });
        const newSessionId = v4();
        const token = generateRefreshTokens({ userId: userId, sessionId: newSessionId });
        await Session.create({
            id: newSessionId,
            token,
            userId: userId,
            expiresAt: new Date(Date.now()).toUTCString()
        }).save();
        return res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
});

export default sessionRouter;