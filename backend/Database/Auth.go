package database

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type RegisterRequest struct {
	Username string `json:"username" binding:"required"` // `binding` для валидации Gin
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"` // Минимальная длина 6
	// Другие поля при необходимости
}

// RegisterUser — функция регистрации нового пользователя.
/*func RegisterUser(db *gorm.DB, username, email, password string) error {
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
} */

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
		var existingUser User // Предполагается, что структура User определена в другом месте
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
		newUser := User{
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

// LoginUser — функция аутентификации пользователя.
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
		var registeredUser User // Предполагается, что структура User определена
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

		// 7. Отправляем успешный ответ
		// Можно просто сообщение об успехе
		// c.JSON(http.StatusOK, gin.H{"message": "Вход выполнен успешно"})

		// Или сообщение об успехе + базовую информацию о пользователе (без пароля!)
		// Или сообщение об успехе + JWT токен
		c.JSON(http.StatusOK, gin.H{
			"message": "Вход выполнен успешно",
			"user": gin.H{
				"id":       registeredUser.ID,
				"username": registeredUser.Username,
				"email":    registeredUser.Email,
			},
			// "token": tokenString, // Если будет JWT
		})
	}
}
