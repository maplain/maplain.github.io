package data

const (
	basedOn = NodeType("Based On")
)

type Data struct {
	Nodes []Node `json:"nodes"`
	Links []Link `json:"links"`
}

func (d *Data) AddLink(s, t string) {
	d.Links = append(d.Links, Link{s, t})
}

type NodeType string

type Node struct {
	Name    string   `json:"name"`
	Company string   `json:"company"`
	Link    string   `json:"link"`
	Type    NodeType `json:"type"`
	X       float32  `json:"x"`
	Y       float32  `json:"y"`
}

type Link struct {
	Source string `json:"source"`
	Target string `json:"target"`
}

var AllData []Data
