require("dotenv").config();
import "reflect-metadata";

import express, { NextFunction, Response, Request } from "express";
import router from "./routes";

import connectDB from "./helpers/connectDB";
import ResponseError from "./types/errorHandler";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

(async () => {

    await connectDB();

    app.use("/", router);

    app.use(function (req, res, next) {
        const error: ResponseError = new Error();
        error.status = 404;
        error.message = "Invalid Route";
        next(error);
    });

    // error handler
    app.use(function (err: ResponseError, req: Request, res: Response, next: NextFunction) {
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};

        res.status(err.status || 500).json(err);
    });

    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });

})();
