import { getConnectionManager } from "typeorm";
import { Router } from "express";
import userRouter from "./user";
import sessionRouter from "./session";

const router = Router();

router.get("/", async (_, res) => {
    const [connection] = getConnectionManager().connections;
    if(connection.isConnected)
        res.status(200).json({message: "Service is available"});
    else
        throw new Error("Database is not connected");
});

router.use("/api/user", userRouter);
router.use("/api/session", sessionRouter);

export default router;