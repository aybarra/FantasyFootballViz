//Simple d3.js barchart example to illustrate d3 selections

//other good related tutorials
//http://www.recursion.org/d3-for-mere-mortals/
//http://mbostock.github.com/d3/tutorial/bar-1.html


var w = 1000
var h = 500


function bars(data)
{

    max = d3.max(data)

    //nice breakdown of d3 scales
    //http://www.jeromecukier.net/blog/2011/08/11/d3-scales-and-color/
    x = d3.scale.linear()
        .domain([0, max])
        .range([0, w])

    y = d3.scale.ordinal()
        .domain(d3.range(data.length))
        .rangeBands([0, h], .2)

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");


    var vis = d3.select("#barchart")

     vis.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis);
    
    //a good written tutorial of d3 selections coming from protovis
    //http://www.jeromecukier.net/blog/2011/08/09/d3-adding-stuff-and-oh-understanding-selections/
    var bars = vis.selectAll("rect.bar")
        .data(data)

    //update
    bars
        .attr("fill", "#0a0")
        .attr("stroke", "#050")

    //enter
    bars.enter()
        .append("svg:rect")
        .attr("class", "bar")
        .attr("fill", "#800")
        .attr("stroke", "#800")


    //exit 
    bars.exit()
    .transition()
    .duration(300)
    .ease("exp")
        .attr("width", 0)
        .remove()


    bars
        .attr("stroke-width", 4)
    .transition()
    .duration(300)
    .ease("quad")
        .attr("width", x)
        .attr("height", y.rangeBand())
        .attr("transform", function(d,i) {
            return "translate(" + [0, y(i)] + ")"
        })

}


function init()
{

    var careerlist = []
    var tot_players = 0
    var tot_points = 0
    var avg_player
    var std_dev
    var yeartuples = []

    d3.json('http://localhost:8000/careers/', function(error,data){
        if (error) throw error;
      
        data.results.forEach(function(d,i) {
            if (d.ff_pts != 0) {
             careerlist.push(d.ff_pts)
             tot_players += 1
             tot_points += d.ff_pts
            }
        });
    
        d3.json('http://localhost:8000/seasons_subset/', function(error,s_data){
            s_data.results.forEach(function(d) {
                if (d.year != 2015) {
                    d.guid = d.season_guid.split("_")[0]
                        if (d.guid.indexOf('.') != -1) {
                            d.guid = d.guid.replace('.','');
                        }
                    d.year = +d.season_guid.split("_")[1]
                    yeartuples.push([d.year, d.season_ff_pts]);
                }
            });
        
            yeartuples.sort(function(a, b) {
                a = a[0];
                b = b[0];
                return a < b ? -1 : (a > b ? 1 : 0);
            });
            var curyear = 0
            var years = []
            var yearlist = []
            var templist = []
            for (var i = 0; i < yeartuples.length; i++) {
                if (curyear != yeartuples[i][0]) {
                    curyear = yeartuples[i][0]
                    years.push(curyear)
                    if (templist.length > 0){ yearlist.push(templist); }
                    templist = []
                } else {
                    templist.push(yeartuples[i][1])
                }
            }
            yearlist.push(templist)

            //setup the svg
            var svg = d3.select("#svg")
                .attr("width", w+100)
                .attr("height", h+100)
            svg.append("svg:rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("stroke", "#000")
                .attr("fill", "none")

            svg.append("svg:g")
                .attr("id", "barchart")
                .attr("transform", "translate(50,50)")
    
            var h_data = d3.layout.histogram()
                        (careerlist);

            //setup our ui
            d3.select("#data1")
                .on("click", function(d,i) {
                    bars(h_data)
                })   
            d3.select("#data2")
                .on("click", function(d,i) {
                    bars(yearlist[0])
                })   
            d3.select("#random")
                .on("click", function(d,i) {
                    num = document.getElementById("num").value
                    bars(random(num))
                })     
            //make the bars
            bars(h_data)
        });
    });
}
