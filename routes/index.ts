import { Router } from "express";
import userRouter from "./user";

const router = Router();

const PATH = process.env.PATH || "/api";

router.get("/", (_, res) => {
    res.status(200).json({message: "Service is available"});
});

router.use(PATH, userRouter);

export default router;