import { Router } from "express";
import User from "../entities/User";
import { generateHash } from "../helpers/passwordHashing";

const userRouter = Router();

userRouter.route("/")
    .get(async (_, res, next) => {
        try {
            const users = await User.find();
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
    .put((_, res) => {
        res.status(405).json({ message: "Method not supported." });
    })
    .delete((req, res, next) => {
        // delete every user
    });

userRouter.route("/:userId")
    .get(async (req, res, next) => {
        const { userId } = req.params;
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
    .post((req, res, next) => {
        res.status(405).json({ message: "Method not supported." });
    })
    .put(async (req, res, next) => {
        const { userId } = req.params;
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
        try {
            const user = await User.findOne({ where: { id: userId } });
            if (user) {
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
    try {
        const user = await User.findOne({ where: { id: userId }, withDeleted: true });
        if (user && user.deletedAt) {
            await user.recover();
            return res.status(200).json({ message: "Account recovered successfully" });
        }
        return res.status(404).json({ message: "User not found" });
    } catch (error) {
        next(error);
    }
});

export default userRouter;