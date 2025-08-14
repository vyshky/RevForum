package controllers

import (
	"REVFORUM/database"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// RegisterHandler — обработчик HTTP-запроса для регистрации.
// RegisterHandler создает обработчик Gin для регистрации новых пользователей.
// Принимает экземпляр *gorm.DB для взаимодействия с базой данных.
func RegisterHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Определение структуры для входящих данных
		// Эта анонимная структура описывает ожидаемый формат JSON в теле запроса.
		var json struct {
			Username string `json:"username" binding:"required"`       // `binding:"required"` требует наличия поля
			Email    string `json:"email" binding:"required,email"`    // `email` добавляет валидацию формата email
			Password string `json:"password" binding:"required,min=6"` // `min=6` требует минимум 6 символов
		}

		// 2. Парсинг и валидация JSON из тела запроса
		// c.ShouldBindJSON парсит тело запроса в структуру json.
		// Если данные не соответствуют структуре или не проходят валидацию,
		// функция возвращает ошибку.
		if err := c.ShouldBindJSON(&json); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные", "details": err.Error()})
			return // Важно: завершаем обработчик при ошибке
		}

		// 3. Проверка уникальности username и email
		// Перед созданием пользователя, проверяем, не существует ли уже
		// пользователь с таким же username или email.
		var existingUser database.User // Предполагается, что структура User определена в другом месте
		result := db.Where("username = ? OR email = ?", json.Username, json.Email).First(&existingUser)
		if result.Error == nil {
			// Если ошибка nil, значит запись найдена - пользователь уже существует.
			c.JSON(http.StatusConflict, gin.H{"error": "Пользователь с таким именем или email уже существует"})
			return
		}
		// Если ошибка НЕ равна ErrRecordNotFound, это означает другую проблему с БД.
		if result.Error != gorm.ErrRecordNotFound {
			// Логируем внутреннюю ошибку и возвращаем общее сообщение клиенту.
			log.Printf("Ошибка БД при проверке уникальности: %v", result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"})
			return
		}
		// Если ошибка ErrRecordNotFound - это ожидаемый результат, продолжаем.

		// 4. Хэширование пароля
		// Никогда не храним пароль в открытом виде!
		// Используем bcrypt для создания хеша пароля.
		// Второй параметр (12) - это "стоимость" или количество раундов хеширования.
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(json.Password), 12)
		if err != nil {
			// Если хеширование не удалось, возвращаем ошибку сервера.
			log.Printf("Ошибка хеширования пароля: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обработки пароля"})
			return
		}

		// 5. Создание объекта пользователя для БД
		// Создаем новый экземпляр структуры User с данными из запроса.
		// Важно: сохраняем ХЕШ пароля, а не оригинальный пароль!
		newUser := database.User{
			Username:     json.Username,
			Email:        json.Email,
			PasswordHash: string(hashedPassword), // Преобразуем []byte в string
			// Поле CreatedAt (если определено как time.Time с соответствующими тегами)
			// будет автоматически заполнено GORM текущим временем.
		}

		// 6. Сохранение пользователя в базе данных
		// Используем GORM для создания новой записи в таблице users.
		if err := db.Create(&newUser).Error; err != nil {
			// Если возникла ошибка при создании (например, нарушение других ограничений БД),
			// логируем и возвращаем ошибку.
			log.Printf("Ошибка создания пользователя в БД: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания пользователя", "details": err.Error()})
			return
		}

		// 7. Отправка успешного ответа
		// Если все прошло успешно, возвращаем статус 201 Created
		// и, опционально, информацию о созданном пользователе (без пароля).
		c.JSON(http.StatusCreated, gin.H{
			"message": "Пользователь успешно зарегистрирован",
			"user": gin.H{ // Возвращаем только безопасные данные
				"id":       newUser.ID,
				"username": newUser.Username,
				"email":    newUser.Email,
				// "created_at": newUser.CreatedAt, // Можно добавить, если поле есть
			},
		})
	}
}
