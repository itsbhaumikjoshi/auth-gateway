import { JwtPayload } from "jsonwebtoken";

export interface RefreshTokenPayload extends JwtPayload {
    jti: string;
    uid: string;
}

export interface AccessTokenPayload extends JwtPayload {
    jti: string;
    uid: string;
    scope: string;
    email: string;
    name: string;
    sub: string;
}
