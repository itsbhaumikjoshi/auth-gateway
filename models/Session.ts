import { Entity, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity("session")
export default class Session extends BaseEntity {

  @PrimaryGeneratedColumn()
  public id!: number;

}