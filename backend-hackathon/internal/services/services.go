package services

import (
	"context"
	"encoding/json"
	"log/slog"

	auth "git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/services/auth"
	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/services/users"
	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/storage"
	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/models"
	tokenManager "git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/pkg/token-manager"
)

type Authorization interface {
	CreateUser(ctx context.Context, user models.UserSignUp) (int, error)
	GenerateToken(ctx context.Context, username, password string) (int64, bool, tokenManager.Tokens, error)
}

type UserOperations interface {
	GetAllUsers(ctx context.Context) ([]models.UserShortly, error)
	GetUserById(ctx context.Context, userId int64) (json.RawMessage, error)
}


type Service struct {
	Authorization
	UserOperations
}

func NewService(logger *slog.Logger, store *storage.Storage, manager *tokenManager.Manager) *Service {
	return &Service{
		Authorization: auth.NewAuthService(logger, store.Authorization, manager),
		UserOperations: users.NewUserService(logger, store.UserOperations),
	}
}