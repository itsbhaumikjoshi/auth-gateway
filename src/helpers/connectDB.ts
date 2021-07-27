import { createConnection } from "typeorm";

export default async function () {
    try {
        const connection = await createConnection();
        return connection;                
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}