package auth

import (
	"context"
	"fmt"
	"log/slog"

	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/storage/postgres"
	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/models"
	"github.com/jmoiron/sqlx"
)

type AuthPostgres struct{
	logger *slog.Logger
	db *sqlx.DB
}

func NewAuthPostgres(logger *slog.Logger, db *sqlx.DB) *AuthPostgres {
	return &AuthPostgres{
		logger: logger,
		db: db,
	}
}

func (r *AuthPostgres) CreateUser(ctx context.Context, user models.UserSignUp) (int, error) {
	const op = "storage.postgres.auth.CreateUser"
	var id int
	query := fmt.Sprintf("INSERT INTO %s (full_name, email, hashed_password, bank_account_number, bank_card_number) values ($1, $2, $3, $4, $5) RETURNING id", postgres.UsersTable)
	row := r.db.QueryRowContext(ctx, query, user.FullName, user.Email, user.Password, user.BankAccountNumber, user.BankCardNumber)
	if err := row.Scan(&id); err != nil {
		return 0, fmt.Errorf("%s : %w", op, err)
	}
	return id, nil
}

func (r *AuthPostgres) GetUser(ctx context.Context, fullName, password string) (int64,bool, error) {
	const op = "storage.postgres.auth.GetUser"
	var userId int64
	var isAdmin bool
	query := fmt.Sprintf("SELECT id, is_admin FROM %s WHERE full_name=$1 AND hashed_password=$2", postgres.UsersTable)

	row := r.db.QueryRowContext(ctx, query, fullName, password)
	if err := row.Scan(&userId, &isAdmin); err != nil {
		return 0, false, fmt.Errorf("%s : %w",op,err)
	}
	return userId, isAdmin, nil
}
