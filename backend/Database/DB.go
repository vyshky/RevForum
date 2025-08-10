package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Предполагается, что структуры User, Themes_Collection, Sub_Themes и другие
// уже определены в других файлах вашего проекта и экспортируются (с большой буквы).

type User struct {
	ID           uint      `gorm:"primaryKey"`           // Уникальный идентификатор
	Username     string    `gorm:"uniqueIndex;not null"` // Имя пользователя, уникальное и обязательное
	Email        string    `gorm:"uniqueIndex;not null"` // Email пользователя, уникальный и обязательное
	PasswordHash string    `gorm:"not null"`             // Хэш пароля, обязательный
	CreatedAt    time.Time // Время создания записи
}

var DB *gorm.DB

func Init() {
	// Загрузка переменных окружения
	err := godotenv.Load("./resource/.env")
	if err != nil {
		log.Fatal("Error loading .env file: ", err)
	}

	// Формирование строки подключения
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_SSLMODE"),
		os.Getenv("DB_TIMEZONE"),
	)

	// Подключение к базе данных
	_db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	// !!! ВАЖНО: Проверка ошибки подключения ДОЛЖНА быть здесь, сразу после gorm.Open !!!
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}
	// Если мы дошли до этой строки, подключение успешно, _db != nil

	// Автоматическая миграция структур в таблицы БД
	// Убедитесь, что все используемые здесь структуры (User, Themes_Collection и т.д.)
	// определены и импортированы (если находятся в других пакетах).
	err = _db.AutoMigrate(
		&User{},              // Модель пользователя
		&Themes_Collection{}, // Модель основных тем
		&Sub_Themes{},        // Модель подтем
		&Topic{},             // Добавьте сюда другие модели, когда они будут созданы
		&Post{},              // Например, Topic и Post для топиков и сообщений
	)
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	fmt.Println("Connected to the database and migrated successfully!")
	DB = _db
}
