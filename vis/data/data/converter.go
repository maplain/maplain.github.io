package data

type DagData struct {
	Nodes []DagNode `json:"nodes"`
	Edges []DagEdge `json:"edges"`
}

func (d *DagData) Convert() Data {
	res := Data{}
	idNodeMap := make(map[int]string)
	for _, d := range d.Nodes {
		res.Nodes = append(res.Nodes, Node{
			Name: d.Title,
			X:    d.X,
			Y:    d.Y,
		})
		idNodeMap[d.ID] = d.Title
	}
	for _, l := range d.Edges {
		res.Links = append(res.Links, Link{
			Source: idNodeMap[l.Source],
			Target: idNodeMap[l.Target],
		})
	}
	return res
}

type DagNode struct {
	Title string  `json:"title"`
	X     float32 `json:"x"`
	Y     float32 `json:"y"`
	ID    int     `json:"id"`
}

type DagEdge struct {
	Source int `json:"source"`
	Target int `json:"target"`
}
