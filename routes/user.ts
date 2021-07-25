import { Router } from "express";

const userRouter = Router();

userRouter.route("/")
.get()
.post()
.put()
.delete();

userRouter.route("/:userId")
.get()
.post()
.put()
.delete();

export default userRouter;