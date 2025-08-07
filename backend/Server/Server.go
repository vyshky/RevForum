package Server

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Init_Server() {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	router.GET("/hello", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Hello, World!"})
	})

	log.Println("Сервер запущен на http://localhost:8080/hello")
	router.Run(":8080")
}
