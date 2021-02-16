package main

import (
	"fmt"
	"log"
	"net"
	"strconv"
	"time"
)

var (
	ip               string // user ip
	ipConnection     string // friend ip
	port             int    // user port
	portConnection   int    // friend port
	proto            = 17
	udpAddr          *net.UDPAddr // connection address
	conn             *net.UDPConn // connection
	messageEvent     = "[message sent]"
	messageEventFail = "[message sending failed]"
	messageEventFlag = false
)

func connect() {
	CallClear()

	fmt.Printf("%v, Write your ip and port\nip: ", userName)
	ip = GetConsoleInput()
	// ip = "127.0.0.1"
	fmt.Printf("port: ")
	port, _ = strconv.Atoi(GetConsoleInput())
	fmt.Printf("Write your friends ip\nip: ")
	ipConnection = GetConsoleInput()
	// ipConnection = "127.0.0.1"
	fmt.Printf("port: ")
	portConnection, _ = strconv.Atoi(GetConsoleInput())

	service := ip + ":" + strconv.Itoa(port)

	var err error
	udpAddr, err = net.ResolveUDPAddr("udp4", service)
	if err != nil {
		log.Fatal(err)
	}
	conn, err = net.ListenUDP("udp", udpAddr)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()
	CallClear()
	fmt.Printf("Connection established!\n")
	go func() {
		for {
			if !handleUDPConnection() {
				fmt.Printf("Disconnected!\n")
				break
			}
		}
	}()
	fmt.Printf("q - send message to connected user\nw - see all messages\ne - exit\n")
	menu()
}

func writeAttempts(writeFunction func([]byte) (int, error), message []byte, attempts int) {
	writeFunction(message)
	time.Sleep(2 * time.Second)
	if !messageEventFlag {
		fmt.Printf("%v, %v\n", messageEventFail, attempts)
		if attempts != 0 {
			writeAttempts(writeFunction, message, attempts-1)
		}
	}
}

func sendUDPResponse(message string) {
	if messageEvent != message {
		SaveMessage(message)
		messageEventFlag = false
	} else {
		messageEventFlag = true
	}
	Conn, _ := net.DialUDP("udp", nil, &net.UDPAddr{IP: net.ParseIP(ipConnection), Port: portConnection, Zone: ""})
	defer Conn.Close()
	writeAttempts(Conn.Write, []byte(message), 3)
}

func handleUDPConnection() bool {
	// here is where you want to do stuff like read or write to client
	buffer := make([]byte, 1024)

	n, addr, err := conn.ReadFromUDP(buffer)

	message := string(buffer[:n])
	fmt.Printf("UDP client: %v %v\n", addr, message)
	messageEventFlag = true
	if messageEvent != message && message != messageEventFail {
		sendUDPResponse(messageEvent)
		SaveMessage(message)
	}

	if err != nil {
		log.Println(err)
		return false
	}
	return true
}
