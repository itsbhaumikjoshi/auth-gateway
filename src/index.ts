require("dotenv").config();
import "reflect-metadata";

import express, { NextFunction, Response, Request } from "express";
import router from "./routes";

import connectDB from "./helpers/connectDB";
import { init } from "./helpers/init";
import { ServerErrors } from "./error";

const app = express();
const PORT = +process.env.PORT! || 5000;
const HOST = process.env.HOST as string || "localhost";

app.use(express.json());

(async () => {

    // function to check the requirements are satisfied or not
    init();

    await connectDB();

    app.use("/", router);

    app.use(function (req, res, next) {
        return res.status(404).json(new ServerErrors("not_found").toJson());
    });

    // error handler
    app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};

        res.status(500).json(new ServerErrors("internal_error").toJson());
    });

    app.listen(PORT, () => {
        console.log(`Server listening on http://${HOST}:${PORT}`);
    });

})();
