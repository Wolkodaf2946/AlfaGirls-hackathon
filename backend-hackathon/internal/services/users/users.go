package users

import (
	"context"
	"log/slog"

	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/storage"
	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/models"
)

type UserService struct {
	logger *slog.Logger
	store  storage.UserOperations
}

func NewUserService(logger *slog.Logger, store storage.UserOperations) *UserService {
	return &UserService{logger: logger, store: store}
}

func (s *UserService) GetAllUsers(ctx context.Context) ([]models.UserShortly, error) {
	return s.store.GetAllUsers(ctx)
}
