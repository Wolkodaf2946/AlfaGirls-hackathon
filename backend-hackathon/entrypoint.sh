cd /app
/bin/goose -dir ./migrations postgres "postgres://wolkodaf:$DB_PASSWORD@db:5432/postgres?sslmode=disable" up
./server