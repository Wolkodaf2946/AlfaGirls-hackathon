package config

import (
	"log"
	"os"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	Env            string `yaml:"env" env-default:"local"`
	Port           string `yaml:"port"`
	MigrationsPath string `yaml:"migrate-path"`
	LogsPath       string `yaml:"logs-path"`
	//--db settings--
	DBHost   string
	DBPort   string `yaml:"dbport"`
	Username string
	Password string
	DBName   string
	SSLMode  string `yaml:"sslmode"`
}

func MustLoad() *Config {
	configPath := os.Getenv("CONFIG_PATH")
	if configPath == "" {
		log.Fatal("config path is empty")
	}
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		log.Fatal("config fiel does not exist: " + configPath)
	}
	var cfg Config
	if err := cleanenv.ReadConfig(configPath, &cfg); err != nil {
		log.Fatal("cannot read config: " + err.Error())
	}
	cfg.DBHost = os.Getenv("DB_HOST")
	cfg.Username = os.Getenv("DB_USERNAME")
	cfg.Password = os.Getenv("DB_PASSWORD")
	cfg.DBName = os.Getenv("DB_NAME")
	if cfg.DBHost == "" || cfg.Username == "" || cfg.Password == "" || cfg.DBName == "" {
		log.Fatal("environment variables are not read")
	}

	return &cfg
}
