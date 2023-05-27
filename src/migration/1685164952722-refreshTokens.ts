import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class refreshTokens1685164952722 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                columns: [
                    {
                        isPrimary: true,
                        name: "id",
                        type: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        type: "uuid",
                        name: "user_id"
                    },
                    {
                        default: "now()",
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
                        isNullable: true,
                    },
                ],
                name: "refresh_tokens",
            })
        );

        await queryRunner.createForeignKey(
            "refresh_tokens",
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createIndex("refresh_tokens", new TableIndex({
            name: "REFRESH_TOKEN_ID_INDEX",
            columnNames: ['id']
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("refresh_tokens")
    }

}
