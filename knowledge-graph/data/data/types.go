package data

type Data struct {
	Nodes []Node `json:"nodes"`
	Links []Link `json:"links"`
}

func (d *Data) AddLink(s, t string) {
	d.Links = append(d.Links, Link{s, t})
}

type Node struct {
	Name    string `json:"name"`
	Company string `json:"company"`
	Link    string `json:"link"`
}

type Link struct {
	Source string `json:"source"`
	Target string `json:"target"`
}

var AllData []Data
