import { Router } from "express";
import { nanoid } from "nanoid";
import { getConnection, getRepository, Like } from "typeorm";
import User from "../entities/User";
import Session from "../entities/Session";
import { generateHash } from "../helpers/passwordHashing";
import { isIdValid } from "../helpers/validation";
import { generateRestoreAccountToken, generateVerificationToken, verifyRestoreAccountToken, verifyVerificationToken } from "../helpers/generateToken";

const userRouter = Router();

const NANOID_CHARACTERS = 10;

/**
 * Methods - [GET, POST, DELETE]
 * Description - Create, Read, Delelte operations for users.
*/
userRouter.route("/")
    .get(async (req, res, next) => {
        const { key, value, limit, skip } = req.query;
        try {
            let users: Array<User>;
            if (key) {
                users = await User.find({
                    take: limit ? +limit : 10,
                    skip: skip ? +skip : 0,
                    where: {
                        [key as string]: Like(`%${value ? value as string : ""}%`)
                    },
                    withDeleted: true
                });
            } else {
                users = await User.find({
                    take: limit ? +limit : 10,
                    skip: skip ? +skip : 0,
                    withDeleted: true
                });
            }
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    })
    .post(async (req, res, next) => {
        const { username, password } = req.body;
        try {
            const hashedPassword = await generateHash(password as string);
            const user = await User.create({ username, password: hashedPassword }).save();
            res.status(201).json({ verificationToken: generateVerificationToken({ userId: user.id }) });
        } catch (error) {
            next(error);
        }
    })
    .delete(async (_, __, next) => {
        try {
            await getRepository(User)
                .createQueryBuilder()
                .softDelete();
        } catch (error) {
            next(error);
        }
    });

/**
* Methods - [GET, PUT, DELETE]
* Description - Read, Update, Delelte operations for a particular user.
*/
userRouter.route("/:userId")
    .get(async (req, res, next) => {
        const { userId } = req.params;
        if (isIdValid(userId))
            return res.status(400).json({ message: "Invalid User ID" });
        try {
            const user = await User.findOne({ where: { id: userId } });
            if (user) {
                res.status(200).json({ user });
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            next(error);
        }
    })
    .put(async (req, res, next) => {
        const { userId } = req.params;
        if (isIdValid(userId))
            return res.status(400).json({ message: "Invalid User ID" });
        if (!req.body.username)
            return res.status(400).json({ message: "Sorry but you can't change this field!" });
        try {
            const user = await User.update({ id: userId }, { username: req.body.username });
            if (user.affected === 1)
                return res.status(200).json({ message: "User info updated" });
            return res.status(404).json({ message: "User not found" });
        } catch (error) {
            next(error);
        }
    })
    .delete(async (req, res, next) => {
        const { userId } = req.params;
        if (isIdValid(userId))
            return res.status(400).json({ message: "Invalid User ID" });
        try {
            const user = await User.findOne({ where: { id: userId } });
            if (user && user.isVerified) {
                user.username = user.username + nanoid(NANOID_CHARACTERS);
                await user.save();
                await user.softRemove();
                return res.status(200).json({
                    restoreAccountToken: generateRestoreAccountToken({ userId: userId }),
                    message: "User deleted successfully, if you want to restore your account, you can do that in 30 days",
                });
            }
            return res.status(404).json({ message: "User not found" });
        } catch (error) {
            next(error);
        }
    });

/**
* Methods - PUT
* Description - restore back the user account
*/
userRouter.put("/restore/:restoreAccountToken", async (req, res, next) => {
    const { restoreAccountToken } = req.params;
    if (!restoreAccountToken)
        return res.status(400).json({ message: "Token not provided" });
    try {
        const { userId } = verifyRestoreAccountToken(restoreAccountToken);
        const user = await User.findOne({ where: { id: userId }, withDeleted: true });
        // the reason of using "!" is, because the user is gonna be there, because it was "deleted". If you mess with the token, it won't be validated.
        await user!.recover();
        return res.status(200).json({ message: "Account recovered successfully, We have changed your username, your new username is " + user!.username });
    } catch (error) {
        next(error);
    }
});

/**
* Methods - GET
* Description - returns if the username exists in the database, not the user data.
*/
userRouter.get("/username/:username", async (req, res, next) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ where: { username } });
        if (user)
            return res.status(409);
        return res.status(200);
    } catch (error) {
        next(error);
    }
});

/**
* Methods - PUT
* Description - Verifies the user
*/
userRouter.put("/verify-user/:verificationToken", async (req, res, next) => {
    const { verificationToken } = req.params;
    if (!verificationToken)
        return res.status(400).json({ message: "Token not provided" });
    try {
        const { userId } = verifyVerificationToken(verificationToken);
        if (isIdValid(userId))
            return res.status(400).json({ message: "Invalid User ID" });
        await User.update({ id: userId }, { isVerified: true });
        return res.status(200).json({ messgae: "Account verified successfully." });
    } catch (error) {
        next(error);
    }
});

/**
* Methods - PUT
* Description - changes the password, and removes all the session of that user, so the user is logged out from all the devices.
*/
userRouter.put("/change-password/:userId", async (req, res, next) => {
    const { userId } = req.params;
    if (isIdValid(userId))
        return res.status(400).json({ message: "Invalid User ID" });
    try {
        const user = await User.findOne({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: "User does not exists" });
        const hashedPassword = await generateHash(req.body.password as string);
        if (user.isVerified) {
            // using transaction for rolling back incase if user password changes, but is not logged out of all sessions
            await getConnection().transaction(async transactionalEntityManager => {
                await transactionalEntityManager.update(User, { id: userId }, { password: hashedPassword });
                await transactionalEntityManager.createQueryBuilder()
                    .softDelete()
                    .from(Session)
                    .where("user_id = :userId", { userId })
                    .execute();
            });
            return res.status(200).json({ messgae: "Password updated successfully, You have been logged out of previously logged in systems." });
        }
        return res.status(400).json({ messgae: "Your account is either deleted or not vverified." });
    } catch (error) {
        next(error);
    }
});

export default userRouter;