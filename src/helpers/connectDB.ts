import { Connection, createConnection } from "typeorm";

/**
 * Description - Establishing database connection, and returns the connection
*/
const connectDB =  async (): Promise<Connection> => {
    try {
        const connection = await createConnection();
        return connection;                
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;