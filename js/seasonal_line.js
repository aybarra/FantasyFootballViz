function generateLineChart(){

    var dataset = []

    var parseDate = d3.time.format("%Y").parse;
    var color = d3.scale.category10();


    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // var x = d3.time.scale()
    //     .range([0, width]);
    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.season_ff_pts); });
    //     .interpolate("basis");

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
          this.parentNode.appendChild(this);
        });
      }


     d3.json('http://localhost:8000/seasons_subset/', function(error,data){
      if (error) throw error;
  
      var curid = []
      var startyear
      var cumpoints
      var numyears
  
      data.results.forEach(function(d) {
        d.guid = d.season_guid.split("_")[0]
        d.year = +d.season_guid.split("_")[1]
        curyear = d.year
    //     d.year = d.season_guid.split("_")[1]
    //     d.year = parseDate(d.year)
    //     console.log(d)
        d.season_ff_pts = +d.season_ff_pts;
        if (curid != d.guid){
            curid = d.guid
            startyear = +d.year
            numyears = 0
            cumpoints = 0
        }
        d.year -= (startyear - 1)
        numyears++
        while (numyears != d.year){
            base = {"guid":d.guid, "year":numyears, "season_ff_pts":0}
            dataset.push(base);
            numyears++
        }
        if (curyear != 2015){ 
           dataset.push(d);
        }
      });

      var dataGroup = d3.nest()
         .key(function(d) {
            return d.guid;
         })
        .entries(dataset);
    
      var keys = d3.keys(dataGroup);
      color.domain(d3.keys(dataGroup));

      x.domain(d3.extent(dataset, function(d) { return d.year; }));
      y.domain(d3.extent(dataset, function(d) { return d.season_ff_pts; }));
    //   x.domain([1,d3.max(dataset, function(d) { return d.year; })]);
    //   y.domain([0,d3.max(dataset, function(d) { return d.season_ff_pts; })]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -42)
          .attr("x", -150)
          .attr("dy", ".71em")   
          .style("text-anchor", "end")
          .text("Seasonal Fantasy Points");

       var focus = svg.append("g")
          .attr("class", "focus")
          .style("display", "none");

      focus.append("circle")
          .attr("r", 4.5);

      focus.append("text")
          .attr("x", 9)
          .attr("dy", ".35em");

       var nameline = svg.append("g")
              .attr("class", "lines")

       var yearline = svg.append("g")
              .attr("class", "lines")

       var pointsline = svg.append("g")
              .attr("class", "lines")

       var averageline = svg.append("g")
              .attr("class", "lines")
         
      nameline.append("text")
              .attr("x", 9)
              .attr("y", 10)

      yearline.append("text")
              .attr("x", 9)
              .attr("y", 25)

      pointsline.append("text")
              .attr("x", 9)
              .attr("y", 40)

      averageline.append("text")
              .attr("x", 9)
              .attr("y", 55)

        dataGroup.forEach(function(d, i) {
          var iline = svg.append("path")
             .attr("class", "line")
             .attr("d", line(d.values))
             .style('stroke-width', 3)
             .style("stroke", "whitesmoke")
            .on("mouseover", function() { 
                    focus.style("display", null); 
                    iline.style("stroke","steelblue")
                    var sel = d3.select(this)
                    sel.moveToFront();

                })
            .on("mouseout", function() { 
                    focus.style("display", "none"); 
                    iline.style("stroke","whitesmoke");
                })
            .on("mousemove", function(){
                    console.log(d)
                    var rawX = x.invert(d3.mouse(this)[0])
                    var year = Math.round(rawX)
                    var pts = d.values[year-1].season_ff_pts
                    var totpts = 0
                    var totyears = d.values.length
                    var bestyr = -10000
                    var worstyr = 10000
                    for (var i = 0; i < totyears; i++) {
                        totpts += d.values[i].season_ff_pts
                        if (d.values[i].season_ff_pts > bestyr){
                            bestyr = d.values[i].season_ff_pts
                        }
                        if (d.values[i].season_ff_pts < worstyr){
                            worstyr = d.values[i].season_ff_pts
                        }
                    }
                    var avg = Math.round(totpts/totyears)
                    console.log(year, pts)
                    focus.attr("transform", "translate(" + x(year) + "," + y(pts) + ")")
                    focus.select("text").text(d.key+"\n  Year: "+year+"\n  Pts:"+pts);
                    focus.moveToFront();
                    nameline.select("text").text("Name: " + d.key);
                    yearline.select("text").text("Years: " + totyears);
                    pointsline.select("text").text("Total Points: " + totpts);
                    averageline.select("text").text("Average/Season: " + avg + " (Best: "+bestyr+", Worst: " + worstyr+")");
                });
         });
       });  
    ;

}