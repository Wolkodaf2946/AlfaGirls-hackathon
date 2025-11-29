package storage

import (
	//"context"

	"context"
	"encoding/json"
	"log/slog"

	auth "git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/storage/postgres/auth"
	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/storage/postgres/users"
	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/models"
	"github.com/jmoiron/sqlx"
)

type Authorization interface {
	CreateUser(ctx context.Context, user models.UserSignUp) (int, error)
	GetUser(ctx context.Context, fullName, password string) (int64,bool,error)
}

type UserOperations interface {
	GetAllUsers(ctx context.Context) ([]models.UserShortly, error)
	GetUserById(ctx context.Context, userId int64) (json.RawMessage, error)
}

type Storage struct{
	Authorization
	UserOperations
}

func NewPostgresStorage(logger *slog.Logger, db *sqlx.DB) *Storage {
	return &Storage{
		Authorization: auth.NewAuthPostgres(logger, db),
		UserOperations: users.NewUsersPostgres(logger, db),
	}
}