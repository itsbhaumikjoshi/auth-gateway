import { Connection, createConnection } from "typeorm";
/**
 * import all your entities here.
*/
import AccessToken from "../entities/AccessToken";
import RefreshToken from "../entities/RefreshToken";
import User from "../entities/User";
/**
 * import all your migrations here.
*/
import { accessTokens1685164961642 } from "../migration/1685164961642-accessTokens";
import { refreshTokens1685164952722 } from "../migration/1685164952722-refreshTokens";
import { users1685164942053 } from "../migration/1685164942053-users";

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
            entities: [
                AccessToken,
                RefreshToken,
                User,
            ],
            migrations: [
                accessTokens1685164961642,
                refreshTokens1685164952722,
                users1685164942053,
            ],
            cli: {
                migrationsDir: "src/migration"
            }
        });
        
        // by default the server runs migrations everytime it restarts, if and only if new migrations are created.
        await connection.runMigrations();
        
        return connection;
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;