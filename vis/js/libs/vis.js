// root = exports ? this

var fixed = true

var Network = function() {
	// variables we want to access
	// in multiple places of Network
	var width = 960
	var height = 800
	// allData will store the unfiltered data
	var allData = []
	var curLinksData = []
	var curNodesData = []
	var linkedByIndex = {}
	// these will hold the svg groups for
	// accessing the nodes and links display
	var nodesG = null
	var linksG = null
	var textsG = null
	// these will point to the circles and lines
	// of the nodes and links
	var node = null
	var text = null
	var link = null

	// our force directed layout
	var simulation = null
	var vis = null
	// color function used to color nodes
	var nodeColors = d3.scaleOrdinal(d3.schemeSet3)
	// tooltip used to display details
	var tooltip = Tooltip("vis-tooltip", 230)

	// Starting point for network visualization
	// Initializes visualization and starts force layout
	var network = function(selection, data) { 
		// format our data
		allData = setupData(data)

		// create our svg and groups
		vis = d3.select(selection).append("svg")
			.attr("width", width)
			.attr("height", height)
			.call(d3.zoom().on("zoom", function () {
				vis.attr("transform", d3.event.transform)
			}))
		linksG = vis.append("g").attr("id", "links")
		nodesG = vis.append("g").attr("id", "nodes")
		textsG = vis.append("g").attr("id", "texts")

		simulation = d3.forceSimulation(allData.nodes)
			.force('charge', d3.forceManyBody().strength(-200))
			.force('center', d3.forceCenter(width/2, height/2))
			.force('link', d3.forceLink().id(function(d){return d.name})
				.links(allData.links).distance(50))
			.on('tick', update)
		if (fixed) {
			simulation.alphaTarget(0)
			simulation.alpha(0)
		}
	}
	network.getData = function() {
		return allData
	}
	// The update() function performs the bulk of the
	// work to setup our visualization based on the
	// current layout/sort/filter.
	// 
	// update() is called everytime a parameter changes
	// and the network needs to be reset.
	var update = function() { 
		// filter data to show based on current filter settings.
		// curNodesData = filterNodes(allData.nodes)
		// curLinksData = filterLinks(allData.links, curNodesData)

		// enter / exit for nodes
		updateNodes()
		updateTexts()
		updateLinks()
	}

	network.updateData = function(newData) { 
		allData = setupData(newData)
		simulation.nodes(allData.nodes)
			.force('link', d3.forceLink().id(function(d){return d.name})
				.links(allData.links).distance(50))
			.force('charge', d3.forceManyBody().strength(-200))
			.force('center', d3.forceCenter(width/2, height/2))
			.on('tick', update)
		if (fixed) {
			simulation.alphaTarget(0)
			simulation.alpha(0)
		} else {
			simulation.alphaTarget(0.5)
		}

		link.remove()
		node.remove()
		simulation.restart()
		update()
	}

	// called once to clean up raw data and switch links to
	// point to node instances
	// Returns modified data
	var setupData = function(data) { 
		if (!fixed) {
			data.nodes.forEach(function(n){ 
				// set initial x/y to values within the width/height
				// of the visualization
				n.x = randomnumber=Math.floor(Math.random()*width)
				n.y = randomnumber=Math.floor(Math.random()*height)
				// add radius to the node so we can use it later
				n.radius = 10
				n.fx = undefined
				n.fy = undefined
			})
		} else {
			var xmax = d3.max(data.nodes, d=>d.x)
			var ymax = d3.max(data.nodes, d=>d.y)
			data.nodes.forEach(function(n){ 
				if (n.x && n.y && n.x != 0 && n.y != 0 ) {
					n.fx = width*n.x/(xmax*1.5)
					n.fy = height*n.y/(ymax*1.5)
				} else {
					n.x = randomnumber=Math.floor(Math.random()*width)
					n.y = randomnumber=Math.floor(Math.random()*height)
				}
				n.radius = 10
			})
		}

		// switch links to point to node objects instead of id's
		data.links.forEach(function(l) {
			// linkedByIndex is used for link sorting
			linkedByIndex[l.source+ "," + l.target] = 1
		})
		return data
	}

	// Helper function to map node id's to node objects.
	// Returns d3.map of ids -> nodes
	var mapNodes = function(nodes) { 
		var nodesMap = d3.map()
		nodes.forEach(function(n, i) { 
			nodesMap.set(n.name, n)
		})
		return nodesMap
	}

	// // Given two nodes a and b, returns true if
	// there is a link between them.
	// Uses linkedByIndex initialized in setupData
	var neighboring = function(a, b) {
		var res = linkedByIndex[a.name+ "," + b.name] || 
			linkedByIndex[b.name+ "," + a.name]
		return res
	}

	// Removes nodes from input array
	// based on current filter setting.
	// Returns array of nodes
	var filterNodes = function(allNodes) {
		allNodes
	}

	// Removes links from allLinks whose
	// source or target is not present in curNodes
	// Returns array of links
	var filterLinks = function(allLinks, curNodes) { 
		curNodes = mapNodes(curNodes)
		allLinks.filter(function(l, i) { 
			curNodes.get(l.source.name) && curNodes.get(l.target.name)
		})
	}

	// enter/exit display for nodes
	var updateNodes = function() { 
		node = nodesG.selectAll("circle.node")
			.data(allData.nodes, function(d) {return d ? d.name+"-node": this.id;})

		node.enter().append("circle")
			.attr("class", "node")
		        .merge(node)
			.attr("id", function(d){return d.name+"-node"})
			.attr("cx", function(d) {return d.x})
			.attr("cy", function(d) {return d.y})
			.attr("r", function(d) {return d.radius})
			.style("fill", function(d) {return nodeColors(d.company)})
			.style("stroke", function(d) {return strokeFor(d)})
			.style("stroke-width", 1.0)
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragstopped))

		node.on("mouseover", showDetails)
			.on("mouseout", hideDetails)
		//node.on("click", exposeDetails)
		node.exit().remove()
       /*         nodesG.selectAll("circle.node")*/
			//.data(allData.nodes, function(d) {return d ? d.name+"-node": this.id;})
			//.call(d3.drag()
				//.on("start", dragstarted)
				/*.on("drag", dragged))*/
	}
	// enter/exit display for texts
	var updateTexts = function() { 
		text = textsG.selectAll("text.info")
			.data(allData.nodes, function(d) {return d ? d.name+"-text": this.id;})

		text.enter().append("text")
			.attr("class", "info")
			.attr("id", function(d){return d.name+"-text"})
		        .merge(text)
			.attr("x", function(d) {return d.x})
			.attr("y", function(d) {return d.y})
			.attr("font-size", 6)
			.attr("text-anchor", "middle")
			.style("stroke", "black")
			.style("stroke-width", 0.5)
			.text(d => d.name)
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragstopped))
		text.exit().remove()
	}

	// enter/exit display for links
	var updateLinks = function() { 
		link = linksG.selectAll("line.link")
			.data(allData.links, function(d) {return d ? d.source.name+"_"+d.target.name : this.id})
		link.enter().append("line")
			.attr("class", "link")
			.attr("stroke", "#ddd")
		        .merge(link)
			.attr("id", function(d){return d.source.name + "_" + d.target.name;})
			.attr("stroke-opacity", 0.8)
			.attr("x1", function(d) {return d.source.x})
			.attr("y1", function(d) {return d.source.y})
			.attr("x2", function(d) {return d.target.x})
			.attr("y2", function(d) {return d.target.y})
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragstopped))
		link.append("title")
			.text(function(d){return d.type})

		link.exit().remove()
	}

	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart()
		//simulation.restart()
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	function dragstopped(d) {
		if (!d3.event.active) simulation.alphaTarget(0);
		// fix it after dragging finishes
		d.fx = d.x
		d.fy = d.y
	}

	// Helper function that returns stroke color for
	// particular node.
	var strokeFor = function(d) { 
		d3.rgb(nodeColors(d.company)).darker().toString()
	}

	var exposeDetails = function(d, i) {
		showDetails(d, i)
		d3.timeout(function(){hideDetails(d, i)}, 1000)
	}

	// Mouseover tooltip function
	var showDetails = function(d,i) { 
       /*         content = '<p class="main">' + d.name + '</span></p>'*/
		/*content += '<hr class="tooltip-hr">'*/
		if (d.company != "") {
			content = '<p class="main">' + d.company+ '</span></p>'
			if (d.link) {
				content += '<hr class="tooltip-hr">'
				content += '<p class="main">' + d.link + '</span></p>'
			}
			tooltip.showTooltip(content,d3.event)
		}

		// higlight connected links
		if (link != null)  {
			link
				.style("stroke", function(l, i) { 
				if (l.source == d || l.target == d ) {
					return "#555"
				} else {
					return "#ddd"
				}
			})
				.style("stroke-opacity", function(l, i) { 
					if (l.source == d || l.target == d) {
						return 1.0
					} else {
						return 0.5
					}
				})
		}

		// highlight neighboring nodes
		// watch out - don't mess with node if search is currently matching
		node.style("stroke", function(n) {
			if (n.searched || neighboring(d, n)) {return "#555"} else {return strokeFor(n)}
		})
			.style("stroke-width", function(n) { 
				if (n.searched || neighboring(d, n)) {return 2.0} else {return 1.0}
			})

		// highlight the node being moused over
		d3.select(this).style("stroke","black")
			.style("stroke-width", 2.0)
	}

	// Mouseout function
	var hideDetails = function(d,i) { 
		d3.timeout(tooltip.hideTooltip, 1000)
		// watch out - don't mess with node if search is currently matching
		node.style("stroke", function(n) {if (!n.searched) {return strokeFor(n)} else {return "#555"}})
			.style("stroke-width", function(n) { if (!n.searched) {return 1.0} else {return 2.0}})
		if (link != null) {
			link.each(function(l) { 
				d3.select(this).style("stroke", "#ddd")
				.style("stroke-opacity", 0.5)
			})
		}
	}

	// Final act of Network() function is to return the inner 'network()' function.
	return network
}

//$("#data_select").on "change", (e) ->
//  dataFile = $(this).val()
//  d3.json "data/#{dataFile}", (json) ->
//    myNetwork.updateData(json)

/*# Activate selector button*/
//var activate = function(group, link) { 
  //d3.selectAll("##{group} a").classed("active", false)
  //d3.select("##{group} ##{link}").classed("active", true)
/*}*/

var myNetwork = Network()

d3.select("#coordinates_select").on("change", function(d) { 
	newconf = d3.select(this).property("value")
	fixed = (newconf == "true")
	dfile = d3.select("#data_select").property("value")
	d3.json(`data/${dfile}`).then(function(json) {
		myNetwork.updateData(json)
	});
})

d3.select("#data_select").on("change", function(d) { 
	dfile = d3.select("#data_select").property("value")
	d3.json(`data/${dfile}`).then(function(json) {
		myNetwork.updateData(json)
	});
})

// handle download data
d3.select("#download-input").on("click", function(){
	var data = myNetwork.getData()
	var saveLinks = [];
	data.links.forEach(function(val, i){
		saveLinks.push({source: val.source.name, target: val.target.name});
	});
	var blob = new Blob([window.JSON.stringify({"nodes": data.nodes, "links": saveLinks})], {type: "text/plain;charset=utf-8"});
	window.saveAs(blob, "mydag.json");
});

var run = function() {
	dfile = d3.select("#data_select").property("value")
	d3.json(`data/${dfile}`).then(function(json) {
		myNetwork("#vis", json);
	});
}

run()
