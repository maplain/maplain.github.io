package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/maplain/interactive_network_demo/data/data"
)

func main() {
	for _, da := range data.AllData {
		d, err := json.Marshal(da)
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		fmt.Println(string(d[:]))
	}
}
