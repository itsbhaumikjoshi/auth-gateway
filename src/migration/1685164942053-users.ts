import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class users1685164942053 implements MigrationInterface {

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
                        length: "150",
                        name: "name",
                        type: "varchar",
                    },
                    {
                        length: "250",
                        name: "username",
                        type: "varchar",
                        isUnique: true
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isUnique: true
                    },
                    {
                        length: "60",
                        name: "password",
                        type: "char",
                    },
                    {
                        name: "scope",
                        type: "text",
                        default: "'email profile'"
                    },
                    {
                        name: "is_verified",
                        type: "bool",
                        default: false
                    },
                    {
                        name: "code",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "code_expiry",
                        type: "timestamptz",
                        isNullable: true,
                    },
                    {
                        default: "now()",
                        name: "created_at",
                        type: "timestamptz",
                    },
                    {
                        default: "now()",
                        name: "updated_at",
                        type: "timestamptz",
                    },
                    {
                        name: "deleted_at",
                        type: "timestamptz",
                        isNullable: true,
                    },
                ],
                name: "users",
            })
        );

        await queryRunner.createIndex("users", new TableIndex({
            name: "USER_USERNAME_INDEX",
            columnNames: ['username']
        }));

        await queryRunner.createIndex("users", new TableIndex({
            name: "USER_EMAIL_INDEX",
            columnNames: ['email']
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users");
    }

}
