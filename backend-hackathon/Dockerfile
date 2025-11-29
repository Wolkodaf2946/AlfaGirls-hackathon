FROM golang:1.25 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN GOPROXY="direct" go mod download
COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd

#============================

FROM alpine:3.21.3

WORKDIR /app

# Создаём непривилегированного пользователя и группу с фиксированными UID/GID
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY . .
ADD https://github.com/pressly/goose/releases/download/v3.24.3/goose_linux_x86_64 /bin/goose
RUN chmod +x /bin/goose
COPY --from=builder /app/server .

# Меняем владельца файлов на созданного пользователя
RUN chown -R appuser:appgroup /app

# Переключаемся на непривилегированного пользователя
USER appuser

EXPOSE 8080

CMD ["sh", "./entrypoint.sh"]