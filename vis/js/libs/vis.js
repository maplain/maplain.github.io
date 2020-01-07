// root = exports ? this

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
	var usesG = null
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
		usesG = vis.append("g").attr("id", "uses")

		simulation = d3.forceSimulation(allData.nodes)
			.force('charge', d3.forceManyBody().strength(-200))
			.force('center', d3.forceCenter(width/2, height/2))
			.force('link', d3.forceLink().id(function(d){return d.name})
				.links(allData.links).distance(50))
			.on('tick', update)

		var dragHandler = d3.drag()
			.on("drag", function () {
				d3.select(this)
					.attr("x", d3.event.x)
					.attr("y", d3.event.y);
			});

		dragHandler(usesG.selectAll("use"));

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

		// reset nodes in force layout
		// simulation.nodes(curNodesData)

		// enter / exit for nodes
		updateNodes()

		updateTexts()
		// simulation.force('link', d3.forceLink().links(curLinksData))
		updateLinks()

		updateUses()
	}

	network.updateData = function(newData) { 
		allData = setupData(newData)
		//link.remove()
		//node.remove()
		update()
	}

	// called once to clean up raw data and switch links to
	// point to node instances
	// Returns modified data
	var setupData = function(data) { 
		data.nodes.forEach(function(n){ 
			// set initial x/y to values within the width/height
			// of the visualization
			n.x = randomnumber=Math.floor(Math.random()*width)
			n.y = randomnumber=Math.floor(Math.random()*height)
			// add radius to the node so we can use it later
			n.radius = 10
		})

		// switch links to point to node objects instead of id's
		data.links.forEach(function(l) {
			// linkedByIndex is used for link sorting
			linkedByIndex["#{l.source.name},#{l.target.name}"] = 1
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
		linkedByIndex[a.name+ "," + b.name] || 
			linkedByIndex[b.name+ "," + a.name]
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
		        .merge(node)
			.attr("class", "node")
			.attr("id", function(d){return d.name+"-node"})
			.attr("cx", function(d) {return d.x})
			.attr("cy", function(d) {return d.y})
			.attr("r", function(d) {return d.radius})
			.style("fill", function(d) {return nodeColors(d.company)})
			.style("stroke", function(d) {return strokeFor(d)})
			.style("stroke-width", 1.0)
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged))

		node.on("mouseover", showDetails)
			.on("mouseout", hideDetails)
		//node.on("click", exposeDetails)
		node.exit().remove()

	}
	// enter/exit display for texts
	var updateTexts = function() { 
		text = textsG.selectAll("text.info")
			.data(allData.nodes, function(d) {return d ? d.name+"-text": this.id;})

		text.enter().append("text")
			.merge(text)
			.attr("class", "info")
			.attr("id", function(d){return d.name+"-text"})
			.attr("x", function(d) {return d.x})
			.attr("y", function(d) {return d.y})
			.attr("font-size", 6)
			.attr("text-anchor", "middle")
			.style("stroke", "black")
			.style("stroke-width", 0.5)
			.text(d => d.name)
		text.exit().remove()
	}

	// enter/exit display for links
	var updateLinks = function() { 
		link = linksG.selectAll("line.link")
			.data(allData.links, function(d) {return d ? "#{d.source.name}_#{d.target.name}" : this.id})
		link.enter().append("line")
		        .merge(link)
			.attr("class", "link")
			.attr("stroke", "#ddd")
			.attr("id", function(d){return "#{d.source.name}_#{d.target.name}";})
			.attr("stroke-opacity", 0.8)
			.attr("x1", function(d) {return d.source.x})
			.attr("y1", function(d) {return d.source.y})
			.attr("x2", function(d) {return d.target.x})
			.attr("y2", function(d) {return d.target.y})
		link.append("title")
			.text(function(d){return d.type})

		link.exit().remove()
	}

	// enter/exit display for uses
	var updateUses= function() { 
		uses = usesG.selectAll("use")
			.data(allData.nodes, function(d) {return d ? d.name+"-use": this.id;})

		uses.enter().append("use")
			.merge(uses)
			.attr("id", function(d){return d.name+"-use"})
			.attr("href", function(d){return d.name+"-node"})
			.attr("x", function(d){return d.x})
			.attr("y", function(d){return d.y})
			.attr("fill", "#039BE5")
			.style("stroke", "black")
			.style("stroke-width", 0.5)
		uses.exit().remove()
	}

	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart()
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
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
		content = '<p class="main">' + d.company+ '</span></p>'
		if (d.link) {
			content += '<hr class="tooltip-hr">'
			content += '<p class="main">' + d.link + '</span></p>'
		}
		tooltip.showTooltip(content,d3.event)

		// higlight connected links
		if (link != nil)  {
			link.attr("stroke", function(l, i) { 
				if (l.source == d || l.target == d ) {return "#555"} 
				else {return "#ddd"}
			})
				.attr("stroke-opacity", function(l, i) { 
					if (l.source == d || l.target == d)
					{return 1.0}
					else {return 0.5}
				})
		}

		// link.each (l) ->
		//   if l.source == d or l.target == d
		//     d3.select(this).attr("stroke", "#555")

		// highlight neighboring nodes
		// watch out - don't mess with node if search is currently matching
		node
			.style("stroke", function(n) {
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
		d3.timeout(tooltip.hideTooltip(), 1000)
		// watch out - don't mess with node if search is currently matching
		node.style("stroke", function(n) {if (!n.searched) {return strokeFor(n)} else {return "#555"}})
			.style("stroke-width", function(n) { if (!n.searched) {return 1.0} else {return 2.0}})
		if (link != nil )
			link.attr("stroke", "#ddd")
				.attr("stroke-opacity", 0.8)
	}

	// Final act of Network() function is to return the inner 'network()' function.
	return network
}

//$("#data_select").on "change", (e) ->
//  dataFile = $(this).val()
//  d3.json "data/#{dataFile}", (json) ->
//    myNetwork.updateData(json)

d3.json("data/cloud_native_virtualization.json").then(function(json) {
	myNetwork = Network();
	myNetwork("#vis", json);
});
