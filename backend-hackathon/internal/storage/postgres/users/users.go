package users

import (
	"context"
	"fmt"
	"log/slog"

	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/storage/postgres"
	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/models"
	"github.com/jmoiron/sqlx"
)

type UserPostgres struct {
	logger *slog.Logger
	db *sqlx.DB
}

func NewUsersPostgres(logger *slog.Logger, db *sqlx.DB) *UserPostgres {
	return &UserPostgres{ logger: logger, db: db,}
}

func (s *UserPostgres) GetAllUsers(ctx context.Context) ([]models.UserShortly, error) {
	const op = "storage.postgres.users.GetAllUsers"
	var users []models.UserShortly
	query := fmt.Sprintf("SELECT id, full_name, email FROM %s", postgres.UsersTable)
	err := s.db.SelectContext(ctx, &users, query)
	if err != nil {
		return []models.UserShortly{}, fmt.Errorf("%s : %s",op,err.Error())
	}
	return users, nil
}