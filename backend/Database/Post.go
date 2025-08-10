package database

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"log"
	"net/http"
	"strconv"
	"time"
)

// Post представляет одно сообщение (пост) в топике.
type Post struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Content   string    `gorm:"type:text;not null" json:"content"` // Содержание сообщения, обязательно
	CreatedAt time.Time `json:"created_at"`                        // Дата создания
	UpdatedAt time.Time `json:"updated_at"`                        // Дата последнего обновления
	AuthorID  uint      `gorm:"not null" json:"author_id"`         // ID автора (ссылка на User)
	TopicID   uint      `gorm:"not null;index" json:"topic_id"`    // ID родительского топика (ссылка на Topic)
	// Поля для связи (не сериализуются в JSON по умолчанию)
	// Author User  `gorm:"foreignKey:AuthorID"` // Связь с пользователем
	// Topic  Topic `gorm:"foreignKey:TopicID"`  // Связь с топиком
}

// CreatePostRequest структура для входящих данных при создании поста.
type CreatePostRequest struct {
	Content string `json:"content" binding:"required"`  // Обязательное поле
	TopicID uint   `json:"topic_id" binding:"required"` // Обязательное поле
	// AuthorID будет браться из токена/сессии пользователя
}

// CreatePostHandler обработчик для создания нового поста.
// POST /api/posts
func CreatePostHandler(c *gin.Context) {
	// TODO: Получить userID из JWT токена (после реализации аутентификации)
	// userID := getUserIDFromContext(c) // Пример функции
	// if userID == 0 {
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
	// 	return
	// }
	// Пока используем фиктивный ID для тестирования
	userID := uint(1) // ЗАМЕНИТЬ НА РЕАЛЬНЫЙ ID ИЗ ТОКЕНА

	var req CreatePostRequest

	// 1. Парсинг и валидация JSON
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные", "details": err.Error()})
		return
	}

	// 2. (Опционально) Проверка существования Topic
	var topic Topic
	if err := DB.First(&topic, req.TopicID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Указанный топик не существует"})
			return
		}
		log.Printf("Ошибка БД при поиске топика: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
		return
	}

	// 3. Создание объекта поста
	newPost := Post{
		Content:  req.Content,
		AuthorID: userID, // Устанавливаем ID автора
		TopicID:  req.TopicID,
		// CreatedAt и UpdatedAt заполнятся автоматически
	}

	// 4. Сохранение в БД
	if err := DB.Create(&newPost).Error; err != nil {
		log.Printf("Ошибка создания поста в БД: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания поста", "details": err.Error()})
		return
	}

	// 5. (Опционально) Обновить updated_at у топика
	// database.DB.Model(&topic).Update("updated_at", time.Now())

	// 6. Отправка успешного ответа (201 Created)
	// Можно вернуть полный объект или только ID и сообщение
	c.JSON(http.StatusCreated, gin.H{
		"message": "Сообщение успешно отправлено",
		"post":    newPost, // Возвращаем созданный пост
	})
}

// GetPostsByTopicHandler обработчик для получения списка постов по ID топика.
// GET /api/topics/:id/posts
// ВАЖНО: Этот маршрут должен идти ПОСЛЕ /api/topics/:id, чтобы не перекрывать его.
// Лучше использовать отдельный префикс, например GET /api/topics/:id/posts
// Или изменить маршрут получения топика на /api/topics/:id/details или подобное.
func GetPostsByTopicHandler(c *gin.Context) {
	// 1. Получение ID топика из параметров URL
	topicIDStr := c.Param("id") // :id из маршрута
	topicID, err := strconv.ParseUint(topicIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный ID топика"})
		return
	}

	// 2. Подготовка переменной для результата
	var posts []Post

	// 3. Запрос к БД для получения постов с указанным TopicID
	// Сортируем по дате создания, старые первыми
	if err := DB.Where("topic_id = ?", topicID).Order("created_at ASC").Find(&posts).Error; err != nil {
		log.Printf("Ошибка получения постов из БД для topic_id=%d: %v", topicID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения сообщений"})
		return
	}

	// 4. Отправка результата в JSON
	c.JSON(http.StatusOK, posts) // Отправляем массив постов
}

// TODO: Добавить обработчики для:
// - Получения конкретного поста по ID (GET /api/posts/:id)
// - Обновления поста (PUT/PATCH /api/posts/:id) (только автор/модератор)
// - Удаления поста (DELETE /api/posts/:id) (только автор/модератор/админ)
