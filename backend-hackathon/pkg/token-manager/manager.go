package tokenManager

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type TokenManager interface {
	NewJWT(userId int64, isAdmin bool, ttl time.Duration) (string, error)
	Parse(accessToken string) (string, error)
}

type Manager struct {
	signingKey string
}

type tokenClaims struct {
	jwt.RegisteredClaims
	UserId  int64 `json:"user_id"`
	IsAdmin bool
}

func NewManager(signingKey string) (*Manager, error) {
	if signingKey == "" {
		return nil, errors.New("empty signing key")
	}
	return &Manager{signingKey: signingKey}, nil
}

//-----------------------

func (m *Manager) NewJWT(userId int64, isAdmin bool, ttl time.Duration) (string, error) {

	claims := tokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
		UserId:  userId,
		IsAdmin: isAdmin,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString([]byte(m.signingKey))
	if err != nil {
		return "", fmt.Errorf("token signature error: %w", err)
	}

	return signedToken, nil
}

//-----------------------

func (m *Manager) Parse(accessToken string) (int64, bool, error) {
	token, err := jwt.ParseWithClaims(accessToken, &tokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(m.signingKey), nil
	})
	if err != nil {
		return 0, false, err
	}

	claims, ok := token.Claims.(*tokenClaims)
	if !ok {
		return 0,false, errors.New("token claims are not of type *tokenClaims")
	}

	return claims.UserId, claims.IsAdmin, nil
}
