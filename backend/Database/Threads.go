package database // Или handlers, или другой подходящий пакет

import (
	"errors"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Themes_Collection представляет основную тему/категорию форума.
type Themes_Collection struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"uniqueIndex;not null" json:"title"` // Предполагаем глобальную уникальность
	CreatedAt time.Time `json:"created_at"`                        // GORM заполнит автоматически
	Status    string    `gorm:"not null" json:"status"`            // Исправлена опечатка в uniqueIndex -> not null
	// Связь с подтемами (если нужно)
	// SubThemes []Sub_Themes `gorm:"foreignKey:ParentID" json:"sub_themes,omitempty"`
}

// Sub_Themes представляет подтему внутри основной темы.
type Sub_Themes struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"not null" json:"title"`           // Не обязательно уникальный глобально
	CreatedAt time.Time `json:"created_at"`                      // GORM заполнит автоматически
	Status    string    `gorm:"not null" json:"status"`          // Исправлена опечатка
	ParentID  uint      `gorm:"not null;index" json:"parent_id"` // Ссылка на Themes_Collection, индекс для быстрого поиска
	// ParentTheme Themes_Collection `gorm:"foreignKey:ParentID"` // GORM связь (если нужно)
}

// CreateThemeRequest структура для входящих данных при создании темы.
type CreateThemeRequest struct {
	Title  string `json:"title" binding:"required"`  // Обязательное поле
	Status string `json:"status" binding:"required"` // Обязательное поле
	// ID и CreatedAt НЕ принимаются от клиента
}

// CreateThemeHandler обработчик для создания новой основной темы.
func CreateThemeHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateThemeRequest

		// 1. Парсинг и валидация JSON из тела запроса
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные", "details": err.Error()})
			return
		}

		// 2. (Опционально) Проверка уникальности Title
		// Эта проверка имеет смысл, если Title должен быть уникальным глобально.
		var existingTheme Themes_Collection
		result := db.Where("title = ?", req.Title).First(&existingTheme)
		if result.Error == nil {
			// Тема с таким названием уже существует
			c.JSON(http.StatusConflict, gin.H{"error": "Тема с данным названием уже существует!"})
			return
		}
		if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
			// Другая ошибка БД
			log.Printf("Ошибка БД при проверке уникальности темы: %v", result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"})
			return
		}

		db.AutoMigrate(&Themes_Collection{})

		// 3. Создание объекта темы для БД
		// GORM автоматически заполнит ID и CreatedAt
		newTheme := Themes_Collection{
			Title:  req.Title,
			Status: req.Status,
			// ID и CreatedAt будут заполнены GORM
		}

		// 4. Сохранение темы в базе данных
		if err := db.Create(&newTheme).Error; err != nil {
			log.Printf("Ошибка создания темы в БД: %v", err)
			// Проверь, может быть ошибка ограничений (например, status не валиден)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания темы", "details": err.Error()})
			return
		}

		// 5. Отправка успешного ответа (201 Created)
		c.JSON(http.StatusCreated, gin.H{
			"message": "Тема успешно создана",
			"theme":   newTheme, // Возвращаем созданную тему (ID, CreatedAt будут заполнены)
		})
	}
}

// GetThemesHandler обработчик для получения списка основных тем.
func GetThemesHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var themes []Themes_Collection

		// Получаем все темы из БД
		if err := db.Find(&themes).Error; err != nil {
			log.Printf("Ошибка получения тем из БД: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения тем"})
			return
		}

		// Отправляем список тем в JSON
		c.JSON(http.StatusOK, themes) // GORM заполнит ID, Title, CreatedAt, Status
	}
}

// TODO: Добавить обработчики для:
// - Создания подтем (CreateSubThemeHandler)
// - Получения подтем по ID родительской темы (GetSubThemesHandler)
// - Получения конкретной темы по ID (GetThemeByIDHandler)
// - Обновления темы (UpdateThemeHandler)
// - Удаления темы (DeleteThemeHandler)

// CreateSubThemeRequest структура для входящих данных при создании подтемы.
type CreateSubThemeRequest struct {
	Title    string `json:"title" binding:"required"`     // Обязательное поле
	Status   string `json:"status" binding:"required"`    // Обязательное поле
	ParentID uint   `json:"parent_id" binding:"required"` // Обязательное поле
}

// CreateSubThemeHandler обработчик для создания новой подтемы.
func CreateSubThemeHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateSubThemeRequest

		// 1. Парсинг и валидация JSON из тела запроса
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректные данные", "details": err.Error()})
			return
		}

		// 2. (Опционально) Проверка существования родительской темы
		var parentTheme Themes_Collection
		if err := db.First(&parentTheme, req.ParentID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Родительская тема не найдена"})
				return
			}
			log.Printf("Ошибка БД при поиске родительской темы: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}

		// 3. (Опционально) Проверка уникальности Title в рамках ParentID
		// var existingSubTheme Sub_Themes
		// result := db.Where("title = ? AND parent_id = ?", req.Title, req.ParentID).First(&existingSubTheme)
		// if result.Error == nil {
		// 	c.JSON(http.StatusConflict, gin.H{"error": "Подтема с таким названием уже существует в этой категории"})
		// 	return
		// }
		// if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// 	log.Printf("Ошибка БД при проверке уникальности подтемы: %v", result.Error)
		// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"})
		// 	return
		// }

		// 4. Создание объекта подтемы для БД
		newSubTheme := Sub_Themes{
			Title:    req.Title,
			Status:   req.Status,
			ParentID: req.ParentID,
			// ID и CreatedAt будут заполнены GORM
		}

		// 5. Сохранение подтемы в базе данных
		if err := db.Create(&newSubTheme).Error; err != nil {
			log.Printf("Ошибка создания подтемы в БД: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания подтемы", "details": err.Error()})
			return
		}

		// 6. Отправка успешного ответа (201 Created)
		c.JSON(http.StatusCreated, gin.H{
			"message":   "Подтема успешно создана",
			"sub_theme": newSubTheme, // Возвращаем созданную подтему
		})
	}
}

// GetSubThemesHandler обработчик для получения списка подтем по ID родительской темы.
// Ожидает ID родительской темы в параметрах URL, например, GET /api/themes/123/subthemes
func GetSubThemesHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Получение ID родительской темы из параметров URL
		parentIDStr := c.Param("id") // Предполагается маршрут вида /api/themes/:id/subthemes
		parentID, err := strconv.ParseUint(parentIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный ID родительской темы"})
			return
		}

		// 2. Подготовка переменной для результата
		var subThemes []Sub_Themes

		// 3. Запрос к БД для получения подтем с указанным ParentID
		if err := db.Where("parent_id = ?", parentID).Find(&subThemes).Error; err != nil {
			log.Printf("Ошибка получения подтем из БД для parent_id=%d: %v", parentID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения подтем"})
			return
		}

		// 4. Отправка результата в JSON
		c.JSON(http.StatusOK, subThemes) // Отправляем массив подтем
	}
}
