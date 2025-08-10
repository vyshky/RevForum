package database

import (
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"log"
	"net/http"
	"strconv"
	"time"
)

// Topic представляет топик или вопрос внутри подтемы.
type Topic struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Title      string    `gorm:"not null" json:"title"`              // Заголовок/вопрос топика
	Content    string    `gorm:"type:text" json:"content"`           // Содержание/описание топика
	CreatedAt  time.Time `json:"created_at"`                         // Дата создания
	UpdatedAt  time.Time `json:"updated_at"`                         // Дата последнего обновления
	AuthorID   uint      `gorm:"not null" json:"author_id"`          // ID автора (ссылка на User)
	SubThemeID uint      `gorm:"not null;index" json:"sub_theme_id"` // ID родительской подтемы (ссылка на Sub_Themes)
	// Поля для связи (не сериализуются в JSON по умолчанию)
	// Author    User      `gorm:"foreignKey:AuthorID"`    // Связь с пользователем
	// SubTheme  Sub_Themes `gorm:"foreignKey:SubThemeID"` // Связь с подтемой
}

// CreateTopicRequest структура для входящих данных при создании топика.
type CreateTopicRequest struct {
	Title      string `json:"title" binding:"required"`        // Обязательное поле - вопрос
	Content    string `json:"content"`                         // Опциональное поле - содержание/описание
	SubThemeID uint   `json:"sub_theme_id" binding:"required"` // Обязательное поле
	// AuthorID будет браться из токена/сессии пользователя
}

// CreateTopicHandler обработчик для создания нового топика.
// POST /api/topics
func CreateTopicHandler(c *gin.Context) {
	// TODO: Получить userID из JWT токена (после реализации аутентификации)
	// userID := getUserIDFromContext(c) // Пример функции
	// if userID == 0 {
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "Пользователь не аутентифицирован"})
	// 	return
	// }
	// Пока используем фиктивный ID для тестирования
	userID := uint(1) // ЗАМЕНИТЬ НА РЕАЛЬНЫЙ ID ИЗ ТОКЕНА

	var req CreateTopicRequest

	// 1. Парсинг и валидация JSON
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные", "details": err.Error()})
		return
	}

	// 2. (Опционально) Проверка существования SubTheme
	var subTheme Sub_Themes
	if err := DB.First(&subTheme, req.SubThemeID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Указанная подтема не существует"})
			return
		}
		log.Printf("Ошибка БД при поиске подтемы: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
		return
	}

	// 3. Создание объекта топика
	newTopic := Topic{
		Title:      req.Title,
		Content:    req.Content,
		AuthorID:   userID, // Устанавливаем ID автора
		SubThemeID: req.SubThemeID,
		// CreatedAt и UpdatedAt заполнятся автоматически
	}

	// 4. Сохранение в БД
	if err := DB.Create(&newTopic).Error; err != nil {
		log.Printf("Ошибка создания топика в БД: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания топика", "details": err.Error()})
		return
	}

	// 5. Отправка успешного ответа (201 Created)
	// Можно вернуть полный объект или только ID и сообщение
	c.JSON(http.StatusCreated, gin.H{
		"message": "Топик успешно создан",
		"topic":   newTopic, // Возвращаем созданный топик
	})
}

// GetTopicsBySubThemeHandler обработчик для получения списка топиков по ID подтемы.
// GET /api/subthemes/:id/topics
// handlers/topic_handlers.go (обновленный фрагмент)
// GetTopicsBySubThemeHandler обработчик для получения списка топиков по ID подтемы.
// GET /api/subthemes/:id/topics
func GetTopicsBySubThemeHandler(c *gin.Context) {
	// 1. Получение ID подтемы из параметров URL
	subThemeIDStr := c.Param("id")
	subThemeID, err := strconv.ParseUint(subThemeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный ID подтемы"})
		return
	}

	// 2. Подготовка переменной для результата
	var topics []Topic

	// 3. Запрос к БД для получения топиков с указанным SubThemeID
	// Сортируем по дате создания, новые первыми
	if err := DB.Where("sub_theme_id = ?", subThemeID).Order("created_at DESC").Find(&topics).Error; err != nil {
		log.Printf("Ошибка получения топиков из БД для sub_theme_id=%d: %v", subThemeID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения топиков"})
		return
	}

	// 4. (Опционально) Получить количество постов для каждого топика
	type TopicWithPostCount struct {
		Topic
		PostCount int64 `json:"post_count"`
	}

	topicsWithCount := make([]TopicWithPostCount, len(topics))
	for i, topic := range topics {
		topicsWithCount[i].Topic = topic
		DB.Model(&Post{}).Where("topic_id = ?", topic.ID).Count(&topicsWithCount[i].PostCount)
	}

	// 5. Отправка результата в JSON
	c.JSON(http.StatusOK, topicsWithCount) // Возвращаем топики с количеством постов
}

// TODO: Добавить обработчики для:
// - Получения конкретного топика по ID (с сообщениями?) (GET /api/topics/:id)
// - Обновления топика (PUT/PATCH /api/topics/:id) (только автор/модератор)
// - Удаления топика (DELETE /api/topics/:id) (только автор/модератор/админ)
