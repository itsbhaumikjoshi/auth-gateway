import { JwtPayload } from "jsonwebtoken";

export default interface Payload extends JwtPayload {
    userId: string
}