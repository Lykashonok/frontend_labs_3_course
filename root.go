package main

import (
	"bufio"
	"fmt"
	"io/ioutil"
	"os"
	"runtime"

	"github.com/eiannone/keyboard"
	"github.com/spf13/cobra"
)

// Routes - rune with func attached to rune
// Main idea - user press button and go to other screen
type Routes = map[rune]func()

// CallClear calling function from clear map[string]func()
func CallClear() {
	value, ok := clear[runtime.GOOS] //runtime.GOOS -> linux, windows, darwin etc.
	if ok {
		value()
	} else {
		panic("Your platform is unsupported! I can't clear terminal screen :(")
	}
}

// GetConsoleInput calling input from console and returns string
func GetConsoleInput() string {
	scanner := bufio.NewScanner(os.Stdin)
	if scanner.Scan() {
		return scanner.Text()
	}
	panic("Input was interrupted")
}

func getKeyPressed() (rune, keyboard.Key) {
	if err := keyboard.Open(); err != nil {
		panic(err)
	}
	defer func() {
		_ = keyboard.Close()
	}()

	char, key, err := keyboard.GetKey()
	if err != nil {
		panic(err)
	}
	return char, key
}

// RouteRequest - assign key to function, if you press, you'll call function
func RouteRequest(routes Routes) {
	for {
		char, _ := getKeyPressed()
		routeToCall := routes[char]
		if routeToCall != nil {
			routeToCall()
			break
		} else {
			continue
		}
	}
}

func exit() {
	CallClear()
	fmt.Printf("G'bye\n")
}

func rootRun(cmd *cobra.Command, argc []string) {
	CallClear()
	fmt.Printf("q - connect to another user\nw - exit\n")
	RouteRequest(Routes{'q': connect, 'w': exit})
}

// SaveMessage - writing message to file named userName_messages
func SaveMessage(message string) {
	f, err := os.OpenFile(userName+"_messages", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0600)
	if err != nil {
		panic(err)
	}

	defer f.Close()

	if _, err = f.WriteString(message + "\n"); err != nil {
		panic(err)
	}
}

// LoadMessages - loading messages from file
func LoadMessages() string {
	messages, _ := ioutil.ReadFile(userName + "_messages")
	return string(messages)
}
