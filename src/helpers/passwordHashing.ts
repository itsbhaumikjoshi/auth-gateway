import { genSalt, hash, compare } from "bcrypt";

export const generateHash = async (password: string) : Promise<string> => {
    const saltRounds = process.env.SALT_ROUNDS || 12;
    const salts = await genSalt(saltRounds as number);
    const hashedPassword = await hash(password, salts);
    return hashedPassword;
}

export const comparePassword = async (password: string, hashedPassword: string) : Promise<boolean> => await compare(password, hashedPassword);