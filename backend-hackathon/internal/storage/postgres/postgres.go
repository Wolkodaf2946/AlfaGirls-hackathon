package postgres

import (
	"fmt"

	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/config"
	"github.com/jmoiron/sqlx"
)

const (
	UsersTable          = "users"
	StoreTypesTable     = "store_types"
	CategoriesTable     = "categories"
	GrantsTable         = "grants"
	PurchaseGroupsTable = "purchase_groups"
	GroupItemsTable     = "group_items"
)

func NewPostgresDB(cfg *config.Config) (*sqlx.DB, error) {
	db, err := sqlx.Open("postgres", fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=%s", cfg.DBHost, cfg.DBPort, cfg.Username, cfg.DBName, cfg.Password, cfg.SSLMode))
	if err != nil {
		return nil, err
	}

	err = db.Ping()
	if err != nil {
		return nil, err
	}

	return db, nil
}
