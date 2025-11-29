package handlers

import (
	"log/slog"
	"time"

	"git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/internal/services"
	tokenManager "git.wolkodaf2946.ru/Wolkodaf/congress-hackathon/pkg/token-manager"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	logger *slog.Logger
	services *services.Service
	manager *tokenManager.Manager
}

func NewHandler(logger *slog.Logger, services *services.Service, manager *tokenManager.Manager) *Handler {
	return &Handler{logger: logger, services: services, manager: manager}
}

func (h *Handler) InitRoutes() *gin.Engine {
	router := gin.Default()
	router.MaxMultipartMemory = 1
	router.RedirectTrailingSlash = false

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	config.ExposeHeaders = []string{"Content-Length"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour

	router.Use(cors.New(config))

	auth := router.Group("/auth/")
	{
		auth.POST("/sign-up/", h.signUp)
		auth.POST("/sign-in/", h.signIn)
	}

	user := router.Group("/user/", h.userIdentity)
	{
		user.GET("/allUsers/", h.getAllUsers)
		user.GET("/userByID", h.getUserById)
	}

	return router
}


