package handlers

import (
	"fmt"
	"net/http"

	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/models"
	"github.com/gin-gonic/gin"
)

func (h *Handler) signUp(c *gin.Context) {
	const op = "handlers.signUp"
	var input models.UserSignUpIn

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, h.logger, http.StatusBadRequest, fmt.Sprintf("%s : %s (invalid input body)", op, err), "invalid input body")
		return
	}
	acc, err := input.BankAccountNumber.Int64()
	if err != nil {
		newErrorResponse(c, h.logger, http.StatusBadRequest, fmt.Sprintf("%s : %s (invalid input body)", op, err), "invalid input body")
		return
	}
	card, err := input.BankCardNumber.Int64()
	if err != nil {
		newErrorResponse(c, h.logger, http.StatusBadRequest, fmt.Sprintf("%s : %s (invalid input body)", op, err), "invalid input body")
		return
	}

	user := models.UserSignUp{
		FullName:          input.FullName,
		Email:             input.Email,
		Password:          input.Password,
		BankAccountNumber: acc,
		BankCardNumber:    card,
	}

	id, err := h.services.Authorization.CreateUser(c.Request.Context(), user)
	if err != nil {
		if err.Error() == "all fields must be filled in" || err.Error() == "the group is specified incorrectly" {
			newErrorResponse(c, h.logger, http.StatusUnprocessableEntity, fmt.Sprintf("%s : %s", op, err.Error()), err.Error())
			return
		}
		newErrorResponse(c, h.logger, http.StatusInternalServerError, fmt.Sprintf("%s : %s", op, err.Error()), err.Error())
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"id": id,
	})
}

func (h *Handler) signIn(c *gin.Context) {
	const op = "handlers.signIn"
	var input models.UserSignIn

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, h.logger, http.StatusBadRequest, fmt.Sprintf("%s : invalid input body", op), err.Error())
		return
	}

	userId, tokens, err := h.services.Authorization.GenerateToken(c.Request.Context(), input.FullName, input.Password)
	if err != nil {
		if err.Error() == "Error getting user: Incorrect user data entered" {
			newErrorResponse(c, h.logger, http.StatusUnauthorized, fmt.Sprintf("%s : %s", op, err.Error()), err.Error())
			return
		} else {
			newErrorResponse(c, h.logger, http.StatusInternalServerError, fmt.Sprintf("%s : %s", op, err.Error()), err.Error())
			return
		}
	}
	c.JSON(http.StatusOK, map[string]interface{}{
		"access_token": tokens.AccessToken,
		"id": userId,
	})

}
