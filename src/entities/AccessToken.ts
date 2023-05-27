import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import RefreshToken from "./RefreshToken";
import User from "./User";

@Entity("access_tokens")
export default class AccessToken extends BaseEntity {

    // serves as jti claim for jwt
    @PrimaryGeneratedColumn("uuid")
    public id!: string;

    @ManyToOne(() => RefreshToken, (rf) => rf.accessTokens, { onDelete: "CASCADE" })
    @JoinColumn({ name: "refresh_token_id" })
    public refreshToken!: RefreshToken | string;

    @ManyToOne(() => User, (user) => user.accessTokens, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    public user!: User | string;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    public createdAt!: Date;

    @Column({ name: "expires_at", type: "timestamptz" })
    public expiresAt!: Date | number | string;

    isValid(): boolean {
        return this.expiresAt < new Date();
    }

}