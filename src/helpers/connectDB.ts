import { Connection, createConnection } from "typeorm";

/**
 * Description - Establishing database connection, and returns the connection
*/
const connectDB =  async (): Promise<Connection> => {
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
            entities: ["dist/src/entities/*.ts"],
            migrations: ["dist/src/migration/*.ts"],
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