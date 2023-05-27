import { Entity, PrimaryGeneratedColumn, BaseEntity, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, BeforeInsert } from "typeorm";
import { comparePassword, generateHash } from "../helpers/passwordHashing";
import AccessToken from "./AccessToken";
import RefreshToken from "./RefreshToken";

@Entity("users")
export default class User extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  // user given name, first_name + " " + last_name
  @Column({
    length: 150,
    type: "varchar",
  })
  public name!: string;

  // a unique username to identify the user
  @Column({
    length: 250,
    unique: true,
    type: "varchar",
  })
  public username!: string;

  // user email address, can be used to send notifications and determine user authenticity
  @Column({
    unique: true,
    type: "varchar",
  })
  public email!: string;

  @Column({ type: "char", length: 60, select: false })
  public password!: string;

  // actions, routes, services users can access
  @Column({ type: "text", default: "email profile" })
  public scope!: string;

  @Column({
    default: false,
    name: "is_verified",
    type: "bool",
  })
  public isVerified!: boolean;

  // code is used for passwrod change
  @Column({
    name: "code",
    nullable: true,
    type: "varchar",
  })
  public code: string | null;

  @Column({
    name: "code_expiry",
    nullable: true,
    type: "timestamptz"
  })
  public codeExpiresAt: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  public deletedAt!: Date;

  @OneToMany(() => AccessToken, (at) => at.user, { cascade: ['soft-remove'] })
  public accessTokens: AccessToken[];

  @OneToMany(() => RefreshToken, (rt) => rt.user, { cascade: ['soft-remove'] })
  public refreshTokens: RefreshToken[];

  async validatePassword(password: string): Promise<boolean> {
    return comparePassword(password, this.password);
  }

  @BeforeInsert()
  async hashpassword() {
      this.password = await generateHash(this.password);
  }

}
