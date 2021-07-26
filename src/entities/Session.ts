import { Entity, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, Column } from "typeorm";

@Entity("sessions")
export default class Session extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column("varchar")
  public token!: string;

  @Column({
    type: "char",
    length: 36,
    name: "user_id"
  })
  public userId!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @Column({ name: "expires_at", type: "timestamptz" })
  public expiresAt!: Date;

}