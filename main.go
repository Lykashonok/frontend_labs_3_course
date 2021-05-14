package main

import (
	"os"
	"os/exec"

	"github.com/spf13/cobra"
)

// 3 Variant

var (
	userName string
	rootCmd  = &cobra.Command{
		Use:   "Local chat",
		Short: "Local chat",
		Long:  `Local chat where you can send and recieve messages.`,
		Run:   rootRun,
	}
	clear map[string]func()
)

func init() {
	rootCmd.PersistentFlags().StringVarP(&userName, "user", "u", "anon", "username you'll use while chatting")
	rootCmd.MarkPersistentFlagRequired("user")
	clear = make(map[string]func())
	clear["linux"] = func() {
		cmd := exec.Command("clear")
		cmd.Stdout = os.Stdout
		cmd.Run()
	}
	clear["windows"] = func() {
		cmd := exec.Command("cmd", "/c", "cls")
		cmd.Stdout = os.Stdout
		cmd.Run()
	}
	_, err := os.OpenFile(userName+"_messages", os.O_APPEND|os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		panic(err)
	}
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		panic(err)
	}
}
