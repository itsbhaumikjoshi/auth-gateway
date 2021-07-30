import { genSalt, hash, compare } from "bcrypt";

/**
 * Description - creates hashed password.
*/
export const generateHash = async (password: string): Promise<string> => await hash(password, await genSalt((process.env.SALT_ROUNDS || 12) as number));

/**
 * Description - compares plain password with, hashed password
*/
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => await compare(password, hashedPassword);