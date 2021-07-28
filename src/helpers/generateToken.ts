import { sign } from "jsonwebtoken";

export const generateRefreshTokens = (data: { userId: string, sessionId: string }) => {
    const token = sign(data, "secret", { expiresIn: '30d' });
    return token;
}

export const generateAccessTokens = (data: { sessionId: string }) => {
    const token = sign(data, "secret", { expiresIn: '2m' });
    return token;
}