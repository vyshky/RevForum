package main

import (
	database "REVFORUM/database"
	server "REVFORUM/server"
)

func main() {
	database.Init()
	server.Init_Server()
}
