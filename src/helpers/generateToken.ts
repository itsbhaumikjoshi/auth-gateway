import { readFileSync } from "fs";
import { sign, verify } from "jsonwebtoken";
import { join } from "path";
import Payload from "../types/jwtPayload";
const REFRESH_PRIVATE_KEY = readFileSync(join(__dirname, '/bin/refresh_private_key.pem'));
const ACCESS_PRIVATE_KEY = readFileSync(join(__dirname, '/bin/access_private_key.pem'));

/**
 * Description - creating the refresh token
*/
export const generateRefreshTokens = (data: { userId: string, sessionId: string }): string => sign(data, REFRESH_PRIVATE_KEY, { expiresIn: '30d', algorithm: "RS256" });

/**
 * Description - creating the access token
*/
export const generateAccessTokens = (data: { sessionId: string }): string => sign(data, ACCESS_PRIVATE_KEY, { expiresIn: '2m', algorithm: "RS256" });

/**
 * Description - creating the verification token. For user account verification
*/
export const generateVerificationToken = (data: { userId: string }): string => sign(data, process.env.ACCOUNT_VERIFICATION_SECRET as string, { expiresIn: '1d' });

/**
 * Description - verify the verification token.
*/
export const verifyVerificationToken = (token: string): Payload => verify(token, process.env.ACCOUNT_VERIFICATION_SECRET as string) as Payload;

/**
 * Description - creating the restore account token to restore the deleted account in 30 days.
*/
export const generateRestoreAccountToken = (data: { userId: string }): string => sign(data, process.env.ACCOUNT_RECOVERY_SECRET as string, { expiresIn: '30d' });

/**
 * Description - verify the verification token.
*/
export const verifyRestoreAccountToken = (token: string): Payload => verify(token, process.env.ACCOUNT_RECOVERY_SECRET as string) as Payload;