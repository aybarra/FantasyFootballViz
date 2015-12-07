var color_set = d3.scale.linear()
	.range(["#3182bd", "#f33"]);

	function drawPCChart(careers, season_data){

		//console.log(careers.length,careers[99]);
		//console.log(season_data.length, season_data[321]);

		var margin = { top: 10, right: 30, bottom: 33, left: 45 }
		, width = parseInt(d3.select('.small-chart').style('width'), 10)
			, width = width// - margin.left - margin.right
			, height = parseInt(d3.select('.small-chart').style('height'), 10)
			, height = height// - margin.top - margin.bottom;

		var players = {};
		var values = {};
		var career_totals = [];

		//Storing player name for later use : pctooltip
		for (var i = 0; i < careers.length; ++i)
		{
			var pguid = careers[i].pguid;
			var pname = careers[i].player_name;
			players[pguid] = {'name' : pname, index: i};
			career_totals[i] = 
			{
				'pass_tds': 0, 
				'ints_thrown': 0, 
				'pass_yards':0,  
				'rec_tds' : 0, 
				'rec_yards': 0,
				"rush_tds": 0,
				"rush_yards": 0,
				//        "games_played": 0,
				//        "kr_tds": 0,
				//        "pr_tds": 0,
				//        "fumbles_lost": 0,
				"season_ff_pts": 0,
				"name" : pname
			};    

			//career_totals[index]= jQuery.extend({}, values[pguid])

		}

		//  console.log(players);

		//Calulate career_totals scores

		//Parse each result, and add to career_totals sum
		for(i=season_data.length -1 ; i>= 0; i--)
		{
			pguid = season_data[i].pguid;
			pname = players[pguid].name;
			index = players[pguid].index;


			career_totals[index].pass_tds += +season_data[i].pass_tds;
			career_totals[index].ints_thrown += +season_data[i].ints_thrown;
			career_totals[index].pass_yards += +season_data[i].pass_yards;
			career_totals[index].rec_tds += +season_data[i].rec_tds;
			career_totals[index].rec_yards += +season_data[i].rec_yards;
			career_totals[index].rush_tds += +season_data[i].rush_tds;
			career_totals[index].rush_yards += +season_data[i].rush_yards;
			//    career_totals[index].games_played += +season_data[i].games_played;
			//    career_totals[index].kr_tds += +season_data[i].kr_tds;
			//    career_totals[index].pr_tds += +season_data[i].pr_tds;
			//    career_totals[index].fumbles_lost += +season_data[i].fumbles_lost;
			career_totals[index].season_ff_pts += +season_data[i].season_ff_pts;
		}

		console.log(career_totals[54]);

		if(typeof career_totals !== "undefined")
		{
			//console.log(season_data);


			//console.log((Math,array.map(function(o){return o.games_played;}))season_data.games_played);
			//console.log(season_data);

			var data_plot = jQuery.extend({}, careers);

			// collect text for first column to adjust left margin
			var firstCell = season_data.map(function(d){return d3.values(d)[0]});

			// find the longest text size in the first row to adjust left margin
			var textLength = 0;
			firstCell.forEach(function(d){
					if (d.length > textLength) textLength = d.length;
					});

			// get parallel coordinates
			graph = d3.parcoords()('#sm-sec-4')
				//.margin({ top: 30, left: 3 * textLength, bottom: 40, right: 0 })
				.alpha(0.6)
				.height(height)
				.width(width)
				.mode("queue")
				.rate(2)
				//        .bundlingStrength(0.2)
				.composite("darken");


			//var dim = ['pguid', 'pass_tds', 'pass_yards', 'ints_thrown', 'rec_yds', 'rush_tds', 'rush_yards'];


			graph.data(career_totals)
				//        .dimensions(dim)  //Specifying dimensions doesn't seem to work. :-(
				.render()
				.ticks(1)
				.brushMode("1D-axes")  // enable brushing
				.reorderable() // I removed this for now as it can mess up with pctooltips
				.interactive();





			// set the initial coloring based on the 1st column
			update_colors(d3.keys(data[0])[0]);

			// click label to activate coloring
			graph.svg.selectAll(".dimensions")
				.on("click", update_colors)
				.selectAll(".label")
				.style("font-size", "6px"); // change font sizes of selected lable


			//add hover event
			d3.select("#pcplot svg")
				.on("mousemove", function() {
						var mousePosition = d3.mouse(this);
						highlightLineOnClick(mousePosition, true); //true will also add tooltip
						})
			.on("mouseout", function(){
					cleanTooltip();
					graph.unhighlight();
					});



		} //End if cumul != Null

		return graph

	}


// update color and font weight of chart based on axis selection
// modified from here: https://syntagmatic.github.io/parallel-coordinates/
function update_colors(dimension) {
	// change the fonts to bold
	graph.svg.selectAll(".dimension")
		.style("font-weight", "normal")
		.filter(function(d) { return d == dimension; })
		.style("font-weight", "bold");

	// change color of lines
	// set domain of color scale
	var values = graph.data().map(function(d){return parseFloat(d[dimension])});
	color_set.domain([d3.min(values), d3.max(values)]);

	// change colors for each line
	graph.color(function(d){return color_set([d[dimension]])}).render();
};


// Add highlight for every line on click
function getCentroids(data){
	// this function returns centroid points for data. I had to change the source
	// for parallelcoordinates and make compute_centroids public.
	// I assume this should be already somewhere in graph and I don't need to recalculate it
	// but I couldn't find it so I just wrote this for now
	var margins = graph.margin();
	var graphCentPts = [];

	data.forEach(function(d){

			var initCenPts = graph.compute_centroids(d).filter(function(d, i){return i%2==0;});

			// move points based on margins
			var cenPts = initCenPts.map(function(d){
					return [d[0] + margins["left"], d[1]+ margins["top"]];
					});

			graphCentPts.push(cenPts);
			});

	return graphCentPts;
}

function getActiveData(){
	// I'm pretty sure this data is already somewhere in graph
	if (graph.brushed()!=false) return graph.brushed();
	return graph.data();
}

function isOnLine(startPt, endPt, testPt, tol){
	// check if test point is close enough to a line
	// between startPt and endPt. close enough means smaller than tolerance
	var x0 = testPt[0];
	var y0 = testPt[1];
	var x1 = startPt[0];
	var y1 = startPt[1];
	var x2 = endPt[0];
	var y2 = endPt[1];
	var Dx = x2 - x1;
	var Dy = y2 - y1;
	var delta = Math.abs(Dy*x0 - Dx*y0 - x1*y2+x2*y1)/Math.sqrt(Math.pow(Dx, 2) + Math.pow(Dy, 2));
	//console.log(delta);
	if (delta <= tol) return true;
	return false;
}

function findAxes(testPt, cenPts){
	// finds between which two axis the mouse is
	var x = testPt[0];
	var y = testPt[1];

	// make sure it is inside the range of x
	if (cenPts[0][0] > x) return false;
	if (cenPts[cenPts.length-1][0] < x) return false;

	// find between which segment the point is
	for (var i=0; i<cenPts.length; i++){
		if (cenPts[i][0] > x) return i;
	}
}

function cleanTooltip(){
	// removes any object under #pctooltip is
	graph.svg.selectAll("#pctooltip")
		.remove();

	graph.svg.selectAll("#tooltip")
		.remove();


}

function addTooltip(clicked, clickedCenPts){

	// sdd tooltip to multiple clicked lines
	var clickedDataSet = [];
	var margins = graph.margin()

		// get all the values into a single list
		// I'm pretty sure there is a better way to write this is Javascript
		for (var i=0; i<clicked.length; i++){
			for (var j=0; j<clickedCenPts[i].length; j++){
				var text = d3.values(clicked[i])[j];
				// not clean at all!
				var x = clickedCenPts[i][j][0] - margins.left;
				var y = clickedCenPts[i][j][1] - margins.top;
				clickedDataSet.push([x, y, text]);
			}
		};

	// add rectangles
	var fontSize = 7;
	var padding = 2;
	var rectHeight = fontSize + 2 * padding; //based on font size

	var tooltip_offset = 20;

	graph.svg.selectAll("rect[id='tooltip']")
		.data(clickedDataSet).enter()
		.append("rect")
		.attr("x", function(d) { return d[0] - d[2].length * 5;})
		.attr("y", function(d) { return d[1] + tooltip_offset - rectHeight + 2 * padding; })
		.attr("rx", "2")
		.attr("ry", "2")
		.attr("id", "tooltip")
		.attr("fill", "grey")
		.attr("opacity", 0.9)
		.attr("width", function(d){return d[2].length * 10;})
		.attr("height", rectHeight);

	// add text on top of rectangle
	graph.svg.selectAll("text[id='tooltip']")
		.data(clickedDataSet).enter()
		.append("text")
		.attr("x", function(d) { return d[0];})
		.attr("y", function(d) { return d[1] + tooltip_offset; })
		.attr("id", "tooltip")
		.attr("fill", "Black")
		.attr("text-anchor", "middle")
		.attr("font-size", fontSize)
		.text( function (d){ return d[2];})
}

function getClickedLines(mouseClick){
	var clicked = [];
	var clickedCenPts = [];

	// find which data is activated right now
	var activeData = getActiveData();

	// find centroid points
	var graphCentPts = getCentroids(activeData);

	if (graphCentPts.length==0) return false;

	// find between which axes the point is
	var axeNum = findAxes(mouseClick, graphCentPts[0]);
	if (!axeNum) return false;

	graphCentPts.forEach(function(d, i){
			if (isOnLine(d[axeNum-1], d[axeNum], mouseClick, 5)){
			clicked.push(activeData[i]);
			clickedCenPts.push(graphCentPts[i]); // for tooltip
			}
			});

	return [clicked, clickedCenPts]
}


function highlightLineOnClick(mouseClick, drawTooltip){

	var clicked = [];
	var clickedCenPts = [];

	clickedData = getClickedLines(mouseClick);

	if (clickedData && clickedData[0].length!=0){

		clicked = clickedData[0];
		clickedCenPts = clickedData[1];

		// highlight clicked line
		graph.highlight(clicked);

		if (drawTooltip){
			// clean if anything is there
			cleanTooltip();
			// add tooltip
			addTooltip(clicked, clickedCenPts);
		}

	}
};

function deletePCChart(graph)
{
	if(typeof graph !== "undefined")
	{
		setTimeout(function() {
				d3.select('#sm-sec-4')
				.remove();
				}, 6000 );
	}



}
