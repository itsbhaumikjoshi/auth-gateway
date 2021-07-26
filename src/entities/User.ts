import { Entity, PrimaryGeneratedColumn, BaseEntity, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

export enum UserRole {
  ADMIN = "admin",
  SUPER_ADMIN = "super admin",
  USER = "user"
}

@Entity("users")
export default class User extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column({
    type: "varchar",
    unique: true,
    length: 150
  })
  public username!: string;

  @Column({ type: "char", length: 60, select: false })
  public password!: string;

  @Column({
    type: "bool",
    default: false,
    name: "is_verified"
  })
  public isVerified!: boolean;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER
  })
  public role!: UserRole;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  public deletedAt!: Date;

}