package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/maplain/interactive_network_demo/data/data"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("usage: go run convert_data.go [input json]")
		os.Exit(1)
	}
	in := os.Args[1]
	d, err := ioutil.ReadFile(in)
	checkError(err)
	dagData := data.DagData{}
	err = json.Unmarshal(d, &dagData)
	checkError(err)
	d, err = json.Marshal(dagData.Convert())
	checkError(err)
	fmt.Println(string(d[:]))
}

func checkError(err error) {
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
