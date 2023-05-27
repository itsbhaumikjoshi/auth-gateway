import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, Column, DeleteDateColumn, OneToMany, ManyToOne } from "typeorm";
import AccessToken from "./AccessToken";
import User from "./User";

@Entity("refresh_tokens")
export default class RefreshToken extends BaseEntity {

  // serves as jti claim for jwt
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: "CASCADE" })
  public user!: User | string;

  @OneToMany(() => AccessToken, (at) => at.refreshToken, { cascade: ['soft-remove'] })
  public accessTokens: AccessToken[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @Column({ name: "expires_at", type: "timestamptz" })
  public expiresAt!: Date | number | string;

  @DeleteDateColumn({ name: "deleted_at" })
  public deletedAt!: Date;

  isValid(): boolean {
    return this.deletedAt !== null && this.expiresAt < new Date();
  }

  needsRenewal(): boolean {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    return this.deletedAt !== null && this.expiresAt > now && this.expiresAt < new Date();
  }

}