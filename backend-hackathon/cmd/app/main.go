package main

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	backendhackathon "git.wolkodaf2946.ru/Wolkodaf/congress-hackathon"
	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/config"
	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/handlers"
	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/services"
	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/storage"
	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/storage/postgres"
	tokenmanager "git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/pkg/token-manager"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

const (
	envLocal = "local"
	envDev   = "dev"
	envProd  = "prod"
)

func main() {
	if err := godotenv.Load(); err != nil {
		panic(fmt.Sprintf("error loading env variables: %s", err.Error()))
	}
	cfg := config.MustLoad()

	logFile, err := os.OpenFile(cfg.LogsPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		panic(err)
	}
	defer logFile.Close()

	logger := setupLogger(cfg.Env, logFile)

	db, err := postgres.NewPostgresDB(cfg)
	if err != nil {
		panic(fmt.Sprintf("failed to initialize db: %s", err.Error()))
	}

	defer func() {
		if err := db.Close(); err != nil {
			panic(fmt.Sprintf("error closing db: %s", err))
		}
	}()

	manager, err := tokenmanager.NewManager(os.Getenv("SIGNING_KEY"))
	if err != nil {
		panic(fmt.Sprintf("error init token manager: %s", err.Error()))
	}


	storage := storage.NewPostgresStorage(logger, db)
	services := services.NewService(logger, storage, manager)
	handlers := handlers.NewHandler(logger, services, manager)

	srv := new(backendhackathon.Server)

	go func() {
		if err := srv.Run(cfg.Port, handlers.InitRoutes()); err != nil && err != http.ErrServerClosed {
			panic(fmt.Sprintf("error occured while running http server: %s", err.Error()))
		}
	}()

	logger.Info("App Started")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)
	<-quit

	logger.Info("App Shutting Down")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Error(fmt.Sprintf("error occured on server shutting down: %s", err.Error()))
	}

	logger.Info("Gracefully stopped")
}

func setupLogger(env string, logFile *os.File) *slog.Logger {
	var log *slog.Logger

	multiWriter := io.MultiWriter(os.Stdout, logFile)

	switch env {
	case envLocal:
		log = slog.New(
			slog.NewTextHandler(multiWriter, &slog.HandlerOptions{Level: slog.LevelDebug}),
		)
	case envDev:
		log = slog.New(
			slog.NewJSONHandler(multiWriter, &slog.HandlerOptions{Level: slog.LevelDebug}),
		)
	case envProd:
		log = slog.New(
			slog.NewJSONHandler(multiWriter, &slog.HandlerOptions{Level: slog.LevelInfo}),
		)
	}

	return log
}
