import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import RefreshToken from "./RefreshToken";
import User from "./User";

@Entity("access_tokens")
export default class AccessToken extends BaseEntity {

    // serves as jti claim for jwt
    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @ManyToOne(() => RefreshToken, (rf) => rf.accessTokens, { onDelete: "CASCADE" })
    public refreshToken!: RefreshToken | string;

    @ManyToOne(() => User, (user) => user.accessTokens, { onDelete: "CASCADE" })
    public user!: User | string;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    public createdAt!: Date;

    @Column({ name: "expires_at", type: "timestamptz" })
    public expiresAt!: Date | number | string;

    isValid(): boolean {
        return this.expiresAt < new Date();
    }

}