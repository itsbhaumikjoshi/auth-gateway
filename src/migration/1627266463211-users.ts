import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class users1627266463211 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        columns: [
          {
            isPrimary: true,
            length: "36",
            name: "id",
            type: "char",
          },
          {
            length: "250",
            name: "username",
            type: "varchar",
            isUnique: true
          },
          {
            length: "60",
            name: "password",
            type: "char",
          },
          {
            name: "is_verified",
            type: "bool",
            default: false
          },
          {
            name: "is_admin",
            type: "bool",
            default: false
          },
          {
            name: "created_at",
            type: "timestamptz",
          },
          {
            name: "updated_at",
            type: "timestamptz",
          },
          {
            name: "deleted_at",
            type: "timestamptz",
          },
        ],
        name: "users",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
  }

}
