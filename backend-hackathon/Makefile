
MIGRATION_DIR := "migrations"

.PHONY: migrate-generate

migrate-up:
	go run ./cmd/migrator --db-url="postgres://wolkodaf:goida228@localhost:5432/postgres?sslmode=disable" --level=up --migrations-path=./migrations --migrations-table=goose_db_version

migrate-down:
	go run ./cmd/migrator --db-url="postgres://wolkodaf:goida228@localhost:5432/postgres?sslmode=disable" --level=down --migrations-path=./migrations --migrations-table=goose_db_version

migrate-generate:
	goose -s -dir $(MIGRATION_DIR) create $(name) sql

swag:
	swag init -g ./cmd/main.go

run:
	swag init -g ./cmd/main.go && go run cmd/main.go
