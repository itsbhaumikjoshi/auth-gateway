import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity("black-listed-session")
export default class BlackListedSession extends BaseEntity {

  @PrimaryGeneratedColumn()
  public id!: number;

}