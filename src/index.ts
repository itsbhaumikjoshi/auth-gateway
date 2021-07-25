require("dotenv").config();

import express from "express";
import router from "../routes";

const app = express();
const PORT = process.env.PORT || 5000;

(async () => {

    app.use("/", router);

    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });

})();
