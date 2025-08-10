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

type User struct {
	ID           uint      `gorm:"primaryKey"`           // Уникальный идентификатор
	Username     string    `gorm:"uniqueIndex;not null"` // Имя пользователя, уникальное и обязательное
	Email        string    `gorm:"uniqueIndex;not null"` // Email пользователя, уникальный и обязательный
	PasswordHash string    `gorm:"not null"`             // Хэш пароля, обязательный
	CreatedAt    time.Time // Время создания записи
}

var DB *gorm.DB

func Init() {
	err := godotenv.Load("./resource/.env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

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

	if err != nil {
		panic("failed to connect to database")
	}

	_db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	_db.AutoMigrate(
		&User{},
		&Themes_Collection{},
		&Sub_Themes{},
	)

	fmt.Println("Connected to the database successfully!")
	DB = _db
}
