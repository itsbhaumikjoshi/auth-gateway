import { Router } from "express";
import { nanoid } from "nanoid";
import { getRepository, Like } from "typeorm";
import User from "../entities/User";
import { generateHash } from "../helpers/passwordHashing";

const userRouter = Router();

const NANOID_CHARACTERS = 10;

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
                    }
                });
            } else {
                users = await User.find({
                    take: limit ? +limit : 10,
                    skip: skip ? +skip : 0
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
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    })
    .delete(async (req, res, next) => {
        try {
            await getRepository(User)
                .createQueryBuilder()
                .softDelete();
        } catch (error) {
            next(error);
        }
    });

userRouter.route("/:userId")
    .get(async (req, res, next) => {
        const { userId } = req.params;
        if (!userId || userId.length !== 36)
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
        if (!userId || userId.length !== 36)
            return res.status(400).json({ message: "Invalid User ID" });
        try {
            const user = await User.update({ id: userId }, req.body);
            if (user.affected === 1)
                return res.status(200).json({ message: "User info updated" });
            return res.status(404).json({ message: "User not found" });
        } catch (error) {
            next(error);
        }
    })
    .delete(async (req, res, next) => {
        const { userId } = req.params;
        if (!userId || userId.length !== 36)
            return res.status(400).json({ message: "Invalid User ID" });
        try {
            const user = await User.findOne({ where: { id: userId } });
            if (user) {
                user.username = user.username + nanoid(NANOID_CHARACTERS);
                await user.save();
                await user.softRemove();
                return res.status(200).json({ message: "User deleted successfully" });
            }
            return res.status(404).json({ message: "User not found" });
        } catch (error) {
            next(error);
        }
    });

userRouter.get("/restore/:userId", async (req, res, next) => {
    const { userId } = req.params;
    if (!userId || userId.length !== 36)
        return res.status(400).json({ message: "Invalid User ID" });
    try {
        const user = await User.findOne({ where: { id: userId }, withDeleted: true });
        if (user && user.deletedAt) {
            // add transaction
            const username = user.username.slice(0, -NANOID_CHARACTERS);
            await user.recover();
            const isUsernameAvailable = await User.findOne({ where: { username } });
            if (isUsernameAvailable)
                return res.status(200).json({ message: "Account recovered successfully, We have changed your username as your username was already taken, your new username is " + user.username });
            user.username = username;
            await user.save();
            return res.status(200).json({ message: "Account recovered successfully" });
        }
        return res.status(404).json({ message: "User not found" });
    } catch (error) {
        next(error);
    }
});

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

export default userRouter;