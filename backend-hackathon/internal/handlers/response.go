package handlers

import (
	"log/slog"

	"github.com/gin-gonic/gin"
)

type errorResponse struct {
	Message string `json:"message"`
}

type statusResponse struct {
	Status string `json:"status"`
}

func newErrorResponse(c *gin.Context, logger *slog.Logger, statusCode int, err string, message string) {
	errorLogger := logger.With("level", statusCode)
	errorLogger.Error(err)
	c.AbortWithStatusJSON(statusCode, errorResponse{message})
}
