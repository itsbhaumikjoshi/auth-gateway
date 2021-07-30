import { sign, verify } from "jsonwebtoken";
import Payload from "../types/jwtPayload";

/**
 * Description - creating the refresh token
*/
export const generateRefreshTokens = (data: { userId: string, sessionId: string }): string => sign(data, "secret", { expiresIn: '30d' });

/**
 * Description - creating the access token
*/
export const generateAccessTokens = (data: { sessionId: string }): string => sign(data, "secret", { expiresIn: '2m' });

/**
 * Description - creating the verification token. For user account verification
*/
export const generateVerificationToken = (data: { userId: string }): string => sign(data, "secret", { expiresIn: '1d' });

/**
 * Description - verify the verification token.
*/
export const verifyVerificationToken = (token: string): Payload => verify(token, "secret") as Payload;

/**
 * Description - creating the restore account token to restore the deleted account in 30 days.
*/
export const generateRestoreAccountToken = (data: { userId: string }): string => sign(data, "secret", { expiresIn: '30d' });

/**
 * Description - verify the verification token.
*/
export const verifyRestoreAccountToken = (token: string): Payload => verify(token, "secret") as Payload;