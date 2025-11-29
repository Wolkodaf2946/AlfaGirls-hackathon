package handlers

import (
	// "log"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	authorizationHeader = "Authorization"
	userCtx             = "userId"
	adminCtx            = "isAdmin"
)

//----

func (h *Handler) userIdentity(c *gin.Context) {
	const op = "handlers.middleware.userIdentity"
	header := c.GetHeader(authorizationHeader)
	if header == "" {
		newErrorResponse(c, h.logger, http.StatusUnauthorized, fmt.Sprintf("%s : empty auth header", op), "empty auth header")
		return
	}

	headerParts := strings.Split(header, " ")
	if len(headerParts) != 2 || headerParts[0] != "Bearer" {
		newErrorResponse(c, h.logger, http.StatusUnauthorized, fmt.Sprintf("%s : invalid auth header", op), "invalid auth header")
		return
	}

	if len(headerParts[1]) == 0 {
		newErrorResponse(c, h.logger, http.StatusUnauthorized, fmt.Sprintf("%s: token is empty", op), "token is empty")
		return
	}

	userId, isAdmin, err := h.manager.Parse(headerParts[1])
	if err != nil {
		newErrorResponse(c, h.logger, http.StatusUnauthorized, fmt.Sprintf("%s : %s", op, err.Error()), err.Error())
		return
	}

	c.Set(userCtx, userId)
	c.Set(adminCtx, isAdmin)
}

//----

func (h *Handler) adminOnly(c *gin.Context) {
	const op = "handlers.middleware.adminOnly"
	is, exists := c.Get(adminCtx) // Получаем роль из контекста
	if !exists {
		newErrorResponse(c, h.logger, http.StatusInternalServerError, fmt.Sprintf("%s : user role not found in context", op), "user role not found in context")
		return
	}

	role, ok := is.(bool) // Приводим роль к строковому типу
	if !ok {
		newErrorResponse(c, h.logger, http.StatusInternalServerError, fmt.Sprintf("%s : user role is of invalid type", op), "user role is of invalid type")
		return
	}

	if !role { // Проверяем, является ли роль "admin"
		newErrorResponse(c, h.logger, http.StatusForbidden, fmt.Sprintf("%s : access denied: admin required", op), "access denied: admin required")
		return
	}

	c.Next()
}

//----

func getUserId(c *gin.Context) (int, error) {
	id, ok := c.Get(userCtx)
	if !ok {
		return 0, errors.New("user id not found")
	}

	idInt, ok := id.(int)
	if !ok {
		return 0, errors.New("user id is of invalid type")
	}

	return idInt, nil
}
