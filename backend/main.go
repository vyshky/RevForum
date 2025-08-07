package main

import (
	// "github.com/gin-gonic/gin"
	"REVFORUM/Database"
	"REVFORUM/Server"
)

func main() {
	Database.Init()
	Server.Init_Server()

}
