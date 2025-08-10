package Server

import (
	database "REVFORUM/database"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func Init_Server() {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	router.GET("/hello", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Hello, World!"})
	})

	config := cors.Config{
		AllowOrigins:     []string{"http://localhost"}, // Адрес твоего React-приложения
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"}, // Добавь Authorization, если используешь JWT
		AllowCredentials: false,                                                                 // Установи true, если используешь куки/credentials
	}
	router.Use(cors.New(config))

	// Определяем маршрут и его обработчик
	router.GET("/api/users", func(c *gin.Context) { // Используем GET и более конкретный путь
		var users []database.User          // Слайс для хранения результатов запроса
		result := database.DB.Find(&users) // Выполняем запрос к БД внутри обработчика
		if result.Error != nil {
			// Обрабатываем ошибку, если запрос к БД не удался
			// log.Println("Ошибка БД:", result.Error) // Логирование ошибки полезно
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"}) // 500 Internal Server Error
			return                                                                       // Важно: завершаем обработчик после ошибки
		}
		// Если успешно, возвращаем данные
		c.JSON(http.StatusOK, users) // 200 OK со списком пользователей
	})

	router.POST("/api/register", database.RegisterHandler(database.DB))
	router.POST("/api/login", database.LoginHandler(database.DB))
	router.GET("/api/themes", database.GetThemesHandler(database.DB))
	router.POST("/api/themes/create", database.CreateThemeHandler(database.DB))

	log.Println("Сервер запущен на http://localhost:8080/hello")
	router.Run(":8080")
}
