import { createHash, randomBytes } from "crypto";
import { DeleteResult, QueryRunner } from "typeorm";
import User from "../entities/User";
import { ServerErrors } from "../error";
import { generateHash } from "../helpers/passwordHashing";

export default class UserService {

    constructor() { }

    async get(id: string, queryRunner: QueryRunner): Promise<User | ServerErrors> {
        const user = await queryRunner.manager.findOne(User, { id });
        return user || new ServerErrors("not_found", `User with user id - ${id} not exists.`);
    }

    async create({
        firstName,
        lastName,
        username,
        email,
        password,
        scope
    }: {
        firstName: string,
        lastName: string,
        username: string,
        email: string,
        password: string,
        scope: string
    }, queryRunner: QueryRunner): Promise<User | ServerErrors> {
        const doesUserExists = await queryRunner.manager.findOne(User, { username, email });
        if (doesUserExists)
            return new ServerErrors("invalid_arguments", `User with username - ${username} and email - ${email} already exists.`);
        const user = await queryRunner.manager.create(User, {
            email,
            name: firstName + lastName,
            username,
            password,
            scope: "email profile " + scope
        }).save();
        return user;
    }

    delete(id: string, queryRunner: QueryRunner): Promise<DeleteResult> {
        return queryRunner.manager.softDelete(User, { id });
    }

    async verifyCredentials(
        { username, password }: { username: string, password: string },
        queryRunner: QueryRunner
    ): Promise<User | ServerErrors> {
        const user = await queryRunner.manager.findOne(User, username.includes("@") ? { email: username } : { username });
        if (!user) return new ServerErrors("not_found", "User not found");
        if (!await user.validatePassword(password)) return new ServerErrors("invalid_arguments", "Username or Password is wrong");
        return user;
    }

    async generateCode({
        email,
        id,
        expires_in = 3600,
    }: {
        email?: string;
        id?: string;
        expires_in: number;
    }, queryRunner: QueryRunner): Promise<{ code: string; expires_in: number; } | ServerErrors> {
        const user = await queryRunner.manager.findOne(User, email ? { email } : { id });
        if (!user) return new ServerErrors("not_found", "User not found");
        const now = new Date();
        now.setSeconds(now.getSeconds() + expires_in);
        const code = randomBytes(32).toString("base64");
        user.code = createHash("sha256").update(code).digest("base64");
        user.codeExpiresAt = now;
        await user.save();
        return {
            code,
            expires_in: 3600
        };
    }

    async verifyUserAccount(code: string, queryRunner: QueryRunner): Promise<boolean | ServerErrors> {
        const user = await queryRunner.manager.findOne(User, { code: createHash("sha256").update(code).digest("base64") });
        if (!user) return new ServerErrors("not_found");
        user.isVerified = true;
        await user.save();
        return true;
    }

    async changePassword({
        code,
        password,
        oldPassword,
        id
    }: {
        password: string,
        oldPassword?: string,
        code?: string,
        id?: string
    }, queryRunner: QueryRunner): Promise<boolean | ServerErrors> {
        if (!code && !id) return new ServerErrors("internal_error");
        const user = await queryRunner.manager.findOne(User, code ? { code: createHash("sha256").update(code).digest("base64") } : { id })
        if (!user) return new ServerErrors("not_found", "User not found");
        if (code) {
            user.code = null;
            user.codeExpiresAt = null;
            user.password = await generateHash(password);
            await user.save();
            return true;
        } else if (oldPassword) {
            if (!user.validatePassword(oldPassword)) return new ServerErrors("invalid_arguments", "Invalid old password provided.");
            user.password = await generateHash(password);
            await user.save();
            return true;
        }
        return new ServerErrors("invalid_arguments");
    }

}