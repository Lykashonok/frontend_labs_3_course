package main

import (
	"fmt"
	"time"
)

func menu() {
	RouteRequest(Routes{'q': sendMessage, 'w': messagesList, 'e': exit})
}

func sendMessage() {
	fmt.Printf("Message:")
	t := time.Now()
	message := fmt.Sprintf("%02d:%02d:%02d", t.Hour(), t.Minute(), t.Second()) + "|" + userName + "|" + GetConsoleInput()
	sendUDPResponse(message)
	menu()
}

func messagesList() {
	fmt.Printf("\nmessages\n%v\n", LoadMessages())
	menu()
}
