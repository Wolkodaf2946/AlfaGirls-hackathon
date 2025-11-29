package tokenManager

import "time"

type Session struct {
	RefreshToken string
	ExpiresAt    time.Time
}

type Tokens struct {
	AccessToken  string
	//RefreshToken string
}
