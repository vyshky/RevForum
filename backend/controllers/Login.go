package controllers

import (
	"REVFORUM/database"
	"errors"
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// LoginHandler — функция аутентификации пользователя.
func LoginHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Определение структуры для входящих данных
		var json struct {
			Username string `json:"username" binding:"required"`
			Password string `json:"password" binding:"required"` // Обычно не ставят min на логине, если не требуется
		}

		// 2. Парсинг и валидация JSON из тела запроса
		if err := c.ShouldBindJSON(&json); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные", "details": err.Error()})
			return
		}

		// 3. Поиск пользователя в БД по имени пользователя
		var registeredUser database.User // Предполагается, что структура User определена
		result := db.Where("username = ?", json.Username).First(&registeredUser)
		if result.Error != nil {
			// Проверяем тип ошибки
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				// Пользователь с таким именем не найден.
				// Для безопасности лучше возвращать общее сообщение, не раскрывая,
				// существует ли пользователь.
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверное имя пользователя или пароль"})
				return
			} else {
				// Другая ошибка БД
				log.Printf("Ошибка БД при поиске пользователя: %v", result.Error)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
				return
			}
		}

		// 4. Сравнение хэша пароля из БД с введенным паролем
		// !!! ВАЖНО: Мы НЕ хэшируем json.Password заново.
		// Мы сравниваем хэш из БД (registeredUser.PasswordHash) с открытым паролем (json.Password).
		err := bcrypt.CompareHashAndPassword([]byte(registeredUser.PasswordHash), []byte(json.Password))
		if err != nil {
			// Ошибка bcrypt.CompareHashAndPassword означает, что пароли не совпадают
			// И снова: для безопасности возвращаем общее сообщение.
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверное имя пользователя или пароль"})
			return
		}

		// 5. Если мы дошли до этого места, значит имя и пароль верны.
		// Пользователь аутентифицирован.

		// 6. (Опционально, но рекомендуется для будущих защищенных запросов)
		// Генерируем JWT-токен для пользователя.
		// tokenString, err := generateJWT(registeredUser.ID) // Ты должен реализовать эту функцию
		// if err != nil {
		//     log.Printf("Ошибка генерации JWT: %v", err)
		//     c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка генерации токена"})
		//     return
		// }

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub": registeredUser.ID,
			"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
		})

		// Sign and get the complete encoded token as a string using the secret
		tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))

		fmt.Println(tokenString, err)

		c.SetSameSite(http.SameSiteLaxMode)
		c.SetCookie("Authorization", tokenString, 3600*24*30, "", "", true, true)

		// 7. Отправляем успешный ответ
		// Можно просто сообщение об успехе
		// c.JSON(http.StatusOK, gin.H{"message": "Вход выполнен успешно"})

		// Или сообщение об успехе + базовую информацию о пользователе (без пароля!)
		// Или сообщение об успехе + JWT токен
		c.JSON(http.StatusOK, gin.H{})
	}
}

func Validate(c *gin.Context) {

	user, _ := c.Get("user")

	c.JSON(http.StatusOK, gin.H{
		"message": user,
	})
}

func LogoutHandler(c *gin.Context) {
	// Удаляем куки авторизации
	c.SetCookie("Authorization", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Вы успешно вышли из системы"})
}
