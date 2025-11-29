package handlers

import (
	"fmt"
	"net/http"
	"regexp"
	"strconv"

	//"strconv"

	"github.com/gin-gonic/gin"
)

func (h *Handler) getAllUsers(c *gin.Context) {
	const op = "handlers.getAllUsers"

	users, err := h.services.UserOperations.GetAllUsers(c.Request.Context())
	if err != nil {
		newErrorResponse(c, h.logger, http.StatusInternalServerError, fmt.Sprintf("%s : %s", op, err.Error()), err.Error())
		return
	}
	 c.JSON(http.StatusOK, users)

}

func (h *Handler) getUserById(c *gin.Context) {
	const op = "handlers.getUserById"
	param := c.Query("id")

	re := regexp.MustCompile(`[^0-9]`)
	cleanedString := re.ReplaceAllString(param, "")

	if cleanedString == "" {
		newErrorResponse(c, h.logger, http.StatusBadRequest, fmt.Sprintf("%s : %s: %s", op, "the line is empty", param), "invalid url")
		return
	}

	id, err := strconv.ParseInt(param, 10, 64)
	if err != nil {
		newErrorResponse(c, h.logger, http.StatusBadRequest, fmt.Sprintf("%s : %s (invalid url)", op, err), "invalid url")
		return
	}
	userId := int64(id)
	user, err := h.services.UserOperations.GetUserById(c.Request.Context(),userId)
	if err != nil {
		newErrorResponse(c, h.logger, http.StatusInternalServerError, fmt.Sprintf("%s : %s", op, err.Error()), err.Error())
		return
	}
	c.Data(http.StatusOK, "application/json; charset=utf-8", user)
}