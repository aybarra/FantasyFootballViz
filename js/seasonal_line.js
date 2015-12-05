function generateLineChart(){

var dataset = []

var parseDate = d3.time.format("%Y").parse;
var color = d3.scale.category10();


var margin = {top: 20, right: 20, bottom: 40, left: 50},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

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

var svg = d3.select("#seasonal_line").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  }

d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

 d3.json('http://localhost:8000/seasons_subset/', function(error,data){
  if (error) throw error;

  var curid = []
  var startyear
  var cumpoints
  var numyears
  var avgcnt = []
  var avgpoints = []
  var avgjoe = {}
  var yearlist = []
  var season_dev = []

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
//         if (avgpoints.length < numyears){
//            avgpoints.push(0)
//            avgcnt.push(0)
//         }
//         avgcnt[numyears-1] += 1
        numyears++
    }
    if (curyear != 2015){
       dataset.push(d);
       if (avgpoints.length < numyears) {
           avgpoints.push(0)
           avgcnt.push(0)
           yearlist.push([])
       }
       avgpoints[numyears-1] += d.season_ff_pts
       avgcnt[numyears-1] += 1
       yearlist[numyears-1].push(d.season_ff_pts)
    }
  });

  for (var i = 0; i < yearlist.length; i++) {
     var stddev = math.std(yearlist[i])
     season_dev.push(stddev)
  }
//   console.log(yearlist)
//   console.log(season_dev)
  avgjoe.key = "AvgJoe"
  avgjoe.values = []
  for (var i = 0; i < avgcnt.length; i++) {
      if (avgcnt[i] > 1){
          season_pts = Math.round(avgpoints[i]/avgcnt[i])
          avgjoe.values.push({"season_ff_pts":season_pts, "year":i+1})
        }
  }

  var goodguy = {}
  var eliteguy = {}
  goodguy.key="GoodGuy"
  eliteguy.key="Elite"
  goodguy.values = []
  eliteguy.values = []
  for (var i = 0; i < avgcnt.length; i++) {
      if (avgcnt[i] > 1){
          season_pts = Math.round(avgjoe.values[i].season_ff_pts + season_dev[i])
          goodguy.values.push({"season_ff_pts":season_pts, "year":i+1})
          season_pts = Math.round(avgjoe.values[i].season_ff_pts + (2*season_dev[i]))
          eliteguy.values.push({"season_ff_pts":season_pts, "year":i+1})
    }
  }

// console.log(avgjoe)

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

//    var summary = svg.append("g")
//       .attr("class", "linesummary");
//       .style("display", "none");

//    summary.append("rect")
//         .attr("width", 100)
//         .attr("height",50)
//         .attr("fill","grey");

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
         .attr("id", d.key)
         .attr("d", line(d.values))
         .style('stroke-width', 3)
         .style("stroke", "whitesmoke")
        .on("mouseover", function() {
                focus.style("display", null);
                iline.style("stroke","steelblue")
                var sel = d3.select(this);
                sel.moveToFront();

            })
        .on("mouseout", function() {
                focus.style("display", "none");
                iline.style("stroke","whitesmoke");
                var sel = d3.select(this);
                sel.moveToBack();
            })
        .on("mousemove", function(){
//                 console.log(d)
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
//                 console.log(year, pts)
                focus.attr("transform", "translate(" + x(year) + "," + y(pts) + ")")
                focus.select("text").text(d.key+"\n  Year: "+year+"\n  Pts:"+pts);
                focus.moveToFront();
                nameline.select("text").text("Name: " + d.key);
                yearline.select("text").text("Years: " + totyears);
                pointsline.select("text").text("Total Points: " + totpts);
                averageline.select("text").text("Average/Season: " + avg + " (Best: "+bestyr+", Worst: " + worstyr+")");
            });
       });


        var avgjoeline = svg.append("path")
                            .attr("class","distribution_lines")
                            .attr("id","avgjoeline")
                            .attr("d",line(avgjoe.values))
                            .attr("fill","none")
                            .style("opacity",0)
                            .style("stroke-width",2)
                            .style("stroke","firebrick")
                            .on("mouseover", function() {
                                    focus.style("display", null);
                                    avgjoeline.style("stroke","indianred")
                                    var sel = d3.select(this)
                                    sel.moveToFront();
                                })
                            .on("mouseout", function() {
                                    focus.style("display", "none");
                                    avgjoeline.style("stroke","firebrick");
                            });

        var goodguyline = svg.append("path")
                            .attr("class","distribution_lines")
                            .attr("id","goodguyline")
                            .attr("d",line(goodguy.values))
                            .attr("fill","none")
                            .style("opacity",0)
                            .style("stroke-width",2)
                            .style("stroke","seagreen")
                            .on("mouseover", function() {
                                    focus.style("display", null);
                                    goodguyline.style("stroke","mediumseagreen")
                                    var sel = d3.select(this)
                                    sel.moveToFront();
                                })
                            .on("mouseout", function() {
                                    focus.style("display", "none");
                                    goodguyline.style("stroke","seagreen");
                            });
//                             .on("mousemove", function(){
// //                 console.log(d)
//                 var rawX = x.invert(d3.mouse(this)[0])
//                 var year = Math.round(rawX)
//                 var pts = goodguy.values[year-1].season_ff_pts
// //                 console.log(year, pts)
//                 focus.attr("transform", "translate(" + x(year) + "," + y(pts) + ")")
//                 focus.select("text").text("Year: "+year+"\n  Pts:"+pts);
//                 focus.moveToFront();
//             });

        var eliteguyline = svg.append("path")
                            .attr("class","distribution_lines")
                            .attr("id","eliteguyline")
                            .attr("d",line(eliteguy.values))
                            .attr("fill","none")
                            .style("stroke-width",2)
                            .style("stroke","salmon")
                            .style("opacity",0)
                            .on("mouseover", function() {
                                    focus.style("display", null);
                                    eliteguyline.style("stroke","darksalmon")
                                    var sel = d3.select(this)
                                    sel.moveToFront();
                                })
                            .on("mouseout", function() {
                                    focus.style("display", "none");
                                    eliteguyline.style("stroke","salmon");
                            });
        eliteguyline.active = true
        goodguyline.active = true
        avgjoeline.active = true

    b_height = height+margin.bottom+margin.top
    var d_button = d3.select("body").append("button")
        .attr("class","button")
        .style("position","relative")
        .style("left", -width-20+"px")
        .text("Average Player")
        .on("click",function(){
                var active = avgjoeline.active ? false : true;
                var opacity = active ? 0 : 1;
                d3.select("#avgjoeline").style("opacity", opacity);
                avgjoeline.active = active;
        });

    d3.select("body").append("button")
        .attr("class","button")
        .style("position","relative")
        .style("left", -width+"px")
        .style("width","60px")
        .text("Good")
        .on("click",function(){
                var active = goodguyline.active ? false : true;
                var opacity = active ? 0 : 1;
                d3.select("#goodguyline").style("opacity", opacity);
                goodguyline.active = active;
        });

    d3.select("body").append("button")
        .attr("class","button")
        .style("position","relative")
        .style("top",-24+"px")
        .style("left", 240+"px")
        .style("width","60px")
        .text("Elite")
        .on("click",function(){
                var active = eliteguyline.active ? false : true;
                var opacity = active ? 0 : 1;
                d3.select("#eliteguyline").style("opacity", opacity);
                eliteguyline.active = active;
//                 if (active == true){
//                     dataGroup.forEach(function(d, i) {
//                         for (var j = 0; j < d.values.length; j++) {
//                             if (d.values[j].season_ff_pts >= eliteguy.values[j].season_ff_pts && avgcnt[j] > 1) {
//                                 sel = d3.select("#"+d.key).style("stroke","grey")
//                                 sel.style("stroke-width", 1)
//                                 sel.moveToFront();
//                             }
//                         }
//                     });
//                 }
        });
   });
;

}
