package Server

import (
	"REVFORUM/Database"
	"github.com/gin-gonic/gin"
	"net/http"
)

func Init_Server() {
	router := gin.Default()
	router.LoadHTMLGlob("templates/*")
	router.Static("/static", "./static")

	/* *****************************************************************************************

	GET Handlers for Home, Login, Registration, and Categories

	****************************************************************************************** */
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{"title": "Добро пожаловать на форум!"})
	})

	router.GET("/login", func(c *gin.Context) {
		c.HTML(http.StatusOK, "login.html", gin.H{"title": "Вход"})
	})

	router.GET("/register", func(c *gin.Context) {
		c.HTML(http.StatusOK, "registration.html", gin.H{"title": "Регистрация"})
	})

	router.GET("/categories", func(c *gin.Context) {
		c.HTML(http.StatusOK, "categories.html", gin.H{"title": "Категории форума"})
	})

	router.GET("/threads", func(c *gin.Context) {
		category := c.Query("category")
		c.HTML(http.StatusOK, "threads.html", gin.H{"category_id": category})
	})

	/*
		router.GET("/thread/:id", func(c *gin.Context) {
			id := c.Param("id")
			c.HTML(http.StatusOK, "thread_view.html", gin.H{"thread_id": id})
		})

		router.GET("/new-thread", func(c *gin.Context) {
			category := c.Query("category")
			c.HTML(http.StatusOK, "thread_new.html", gin.H{"category_id": category})
		}) */

	/* *****************************************************************************************

	POST Handlers for User Registration, Login, and Thread Management

	****************************************************************************************** */
	router.POST("/register", Database.RegisterHandler(Database.DB))

	router.POST("/login", func(c *gin.Context) {
		username := c.PostForm("username")
		password := c.PostForm("password")

		Database.LoginUser(Database.DB, username, password)
	})

	router.POST("/new-thread", func(c *gin.Context) {
		title := c.PostForm("title")
		categoryID := c.PostForm("category_id")
		c.String(http.StatusOK, "Тема создана! Заголовок: %s, Категория: %s", title, categoryID)
	})

	router.POST("/thread/:id/reply", func(c *gin.Context) {
		id := c.Param("id")
		c.String(http.StatusOK, "Ответ добавлен в тему #%s", id)
	})
	router.Run(":8080")
}
