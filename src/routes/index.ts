import { getConnectionManager } from "typeorm";
import { Router } from "express";
import userRouter from "./user";
import tokenRouter from "./user";

const router = Router();

router.get("/", async (_, res) => {
    const [connection] = getConnectionManager().connections;
    if (connection.isConnected)
        res.status(200).json({ message: "Service is available" });
    else
        throw new Error("Database is not connected");
});

router.use("/api/users", userRouter);
router.use("/api/tokens", tokenRouter);

export default router;