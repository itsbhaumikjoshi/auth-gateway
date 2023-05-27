import { existsSync } from "fs";
import { join } from "path";

export const init = () => {
    
    const PATH = process.env.NODE_ENV === "production" ? "/" : "/../../";

    if (
        !existsSync(join(__dirname, PATH + "bin/refresh_private_key.pem")) ||
        !existsSync(join(__dirname, PATH + "bin/access_private_key.pem"))
    ) {
        console.error(`access_private_key.pem and refresh_private_key.pem missing in bin folder.`);
        process.exit(1);
    }

    const {
        PORT,
        HOST,

        REFRESH_PASSPHRASE,
        ACCESS_PASSPHRASE,
        REFRESH_TOKEN_EXPIRY,
        ACCESS_TOKEN_EXPIRY,

        DB_HOST,
        DB_USER,
        DB_PASSWORD,
        DB_NAME,
        DB_PORT,
    } = process.env;
    if (!PORT || !HOST) {
        console.error(`Please add PORT and HOST as env vars.`);
    } else if (!DB_HOST || !DB_NAME || !DB_PASSWORD || !DB_PORT || !DB_USER) {
        console.error(`Any of the given varaiables missing in env -> DB_HOST, DB_NAME, DB_PORT, DB_USER, DB_PASSWORD`);
    } else if (!REFRESH_PASSPHRASE || !ACCESS_PASSPHRASE) {
        console.error(`JWT passphrase missing, please add REFRESH_PASSPHRASE and ACCESS_PASSPHRASE.`)
    } else if (!REFRESH_TOKEN_EXPIRY || !ACCESS_TOKEN_EXPIRY) {
        console.error(`Token expiry in seconds is missing`);
    } else
        return;
    process.exit(1);
};