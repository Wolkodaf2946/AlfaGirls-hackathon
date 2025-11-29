package auth

import (
	"context"
	"crypto/sha1"
	"fmt"
	"log/slog"
	"os"
	"time"

	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/storage"
	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/models"
	tokenManager "git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/pkg/token-manager"
)

type AuthService struct {
	logger *slog.Logger
	store    storage.Authorization
	manager *tokenManager.Manager
}

func NewAuthService(logger *slog.Logger, repo storage.Authorization, manager *tokenManager.Manager) *AuthService {
	return &AuthService{logger: logger, store: repo, manager: manager}

}

const (
	accessTokenTTL  = 10000 * time.Minute
)

func (s *AuthService) CreateUser(ctx context.Context, user models.UserSignUp) (int, error) {
	const op = "services.auth.CreateUser"
	if user.FullName == "" || user.Email == "" || user.Password == "" {
		return 0, fmt.Errorf("%s : all fields must be filled in", op)
	}
	user.Password = generatePasswordHash(user.Password)
	return s.store.CreateUser(ctx, user)
}

//----

func (s *AuthService) GenerateToken(ctx context.Context, username, password string) (int64, bool, tokenManager.Tokens, error) {
	const op = "services.auth.GenerateToken"
	userId, isAdmin, err := s.store.GetUser(ctx, username, generatePasswordHash(password))
	if err != nil {
		return -1, false, tokenManager.Tokens{}, fmt.Errorf("error getting user: incorrect user data entered")
	}
	access, err := s.manager.NewJWT(userId, isAdmin, accessTokenTTL)
	if err != nil {
		return -1, false, tokenManager.Tokens{}, fmt.Errorf("%s : %w",op,err)
	}
	return userId, isAdmin, tokenManager.Tokens{AccessToken: access}, nil
}

//----
func generatePasswordHash(password string) string {
	hash := sha1.New()
	hash.Write([]byte(password))
	return fmt.Sprintf("%x", hash.Sum([]byte(os.Getenv("SALT"))))
}
//----
