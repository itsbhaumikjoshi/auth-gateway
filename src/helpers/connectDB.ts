import { Connection, createConnection } from "typeorm";
/**
 * import all your entities here.
*/
import User from "../entities/User";
import Session from "../entities/Session";
/**
 * import all your migrations here.
*/
import { users1627266463211 } from "../migration/1627266463211-users";
import { sessions1627302780892 } from "../migration/1627302780892-sessions";

/**
 * Description - Establishing database connection, and returns the connection
*/
const connectDB = async (): Promise<Connection> => {
    const {
        DB_HOST,
        DB_USER,
        DB_PASSWORD,
        DB_NAME,
        DB_PORT
    } = process.env;

    try {
        const connection = await createConnection({
            type: "postgres",
            host: DB_HOST as string,
            port: +DB_PORT!,
            username: DB_USER as string,
            password: DB_PASSWORD as string,
            database: DB_NAME as string,
            logging: false,
            synchronize: true,
            entities: [
                User,
                Session
            ],
            migrations: [
                users1627266463211,
                sessions1627302780892
            ],
            cli: {
                migrationsDir: "src/migration"
            }
        });
        return connection;
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;