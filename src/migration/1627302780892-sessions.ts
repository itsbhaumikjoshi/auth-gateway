import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class sessions1627302780892 implements MigrationInterface {

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
            length: "36",
            name: "user_id",
            type: "char",
          },
          {
            name: "token",
            type: "varchar"
          },
          {
            name: "access_tokens",
            type: "int"
          },
          {
            name: "created_at",
            type: "timestamptz",
          },
          {
            name: "expires_at",
            type: "timestamptz",
          },
          {
            name: "deleted_at",
            type: "timestamptz",
          },
        ],
        name: "sessions",
      })
    );

    await queryRunner.createForeignKey(
      "sessions",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("sessions");
  }

}
