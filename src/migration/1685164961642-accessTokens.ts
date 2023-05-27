import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class accessTokens1685164961642 implements MigrationInterface {

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
                        type: "uuid",
                        name: "refresh_token_id"
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
                ],
                name: "access_tokens",
            })
        );

        await queryRunner.createForeignKey(
            "access_tokens",
            new TableForeignKey({
                columnNames: ["refresh_token_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "refresh_tokens",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "access_tokens",
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createIndex("access_tokens", new TableIndex({
            name: "ACCESS_TOKEN_ID_INDEX",
            columnNames: ['id']
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("access_tokens");
    }

}
