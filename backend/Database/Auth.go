package Database

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"net/http"
)

// RegisterUser — функция регистрации нового пользователя.
func RegisterUser(db *gorm.DB, username, email, password string) error {
	// Генерируем хеш пароля с использованием bcrypt
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return err
	}

	// Создаём объект пользователя
	user := User{ // Просто User, так как мы в том же пакете Database
		Username:     username,
		Email:        email,
		PasswordHash: string(hash),
	}

	result := db.Create(&user)
	return result.Error
}

// RegisterHandler — обработчик HTTP-запроса для регистрации.
func RegisterHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Извлекаем данные из формы
		username := c.PostForm("username")
		email := c.PostForm("email")
		password := c.PostForm("password")

		// Проверяем, что все поля заполнены
		if username == "" || email == "" || password == "" {
			c.HTML(http.StatusBadRequest, "registration.html", gin.H{
				"title": "Регистрация",
				"error": "Все поля обязательны для заполнения!",
			})
			return
		}

		// Выполняем регистрацию пользователя
		err := RegisterUser(db, username, email, password)
		if err != nil {
			c.HTML(http.StatusBadRequest, "registration.html", gin.H{
				"title": "Регистрация",
				"error": fmt.Sprintf("Ошибка регистрации: %v", err),
			})
			return
		}

		// Перенаправляем на страницу входа после успешной регистрации
		c.Redirect(http.StatusSeeOther, "/login")
	}
}

// LoginUser — функция аутентификации пользователя.
func LoginUser(db *gorm.DB, username, password string) (*User, error) {
	var user User

	// Ищем пользователя по имени
	if err := db.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, err
	}
	fmt.Println("Пользователь найден:", user.Username)

	// Сравниваем хеш пароля с введённым
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, err
	}
	fmt.Println("Пароль совпадает для пользователя:", user.Username)

	// Возвращаем указатель на пользователя при успешной проверке
	return &user, nil
}
