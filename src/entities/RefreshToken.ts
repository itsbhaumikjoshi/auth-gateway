import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, Column, DeleteDateColumn, OneToMany, ManyToOne } from "typeorm";
import AccessToken from "./AccessToken";
import User from "./User";

@Entity("refresh_tokens")
export default class RefreshToken extends BaseEntity {

  // serves as jti claim for jet
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: "CASCADE" })
  public user: User;

  @OneToMany(() => AccessToken, (at) => at.refreshToken, { cascade: ['soft-remove'] })
  public accessTokens: AccessToken[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @Column({ name: "expires_at", type: "timestamptz" })
  public expiresAt!: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  public deletedAt!: Date;

}