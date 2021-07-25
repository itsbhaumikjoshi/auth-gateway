import { Entity, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity("user")
export default class User extends BaseEntity {

  @PrimaryGeneratedColumn()
  public id!: number;

}