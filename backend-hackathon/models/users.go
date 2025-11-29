package models

import "encoding/json"

type User struct {
	Id                int64
	FullName          string
	Email             string
	Password          string
	IsAdmin           bool
	BankAccountNumber int64
	BankCardNumber    int64
	CreatedAt         string
}

type UserSignUpIn struct {
	FullName          string      `json:"full_name"`
	Email             string      `json:"email"`
	Password          string      `json:"password"`
	BankAccountNumber json.Number `json:"bank_account_number"`
	BankCardNumber    json.Number `json:"bank_card_number"`
}

type UserSignUp struct {
	FullName          string `json:"full_name"`
	Email             string `json:"email"`
	Password          string `json:"password"`
	BankAccountNumber int64  `json:"bank_account_number"`
	BankCardNumber    int64  `json:"bank_card_number"`
}

type UserSignIn struct {
	FullName string `json:"full_name"`
	Password string `json:"password"`
}

type UserShortly struct {
	Id       int64  `json:"id" db:"id"`
	FullName string `json:"full_name" db:"full_name"`
	Email    string `json:"email" db:"email"`
}
