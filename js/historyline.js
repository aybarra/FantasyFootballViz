function generateHistoryLine(data){

    var dataset = [];
    var selected_color = "cornflowerblue"
    var parseDate = d3.time.format("%Y").parse;
    var color = d3.scale.category10();


    var margin = {top: 20, right: 20, bottom: 40, left: 50},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var absyear = false;

    var xTime = d3.time.scale()
                  .range([0, width]);

    var x = d3.scale.linear()
              .range([0, width]);

    var y = d3.scale.linear()
              .range([height, 0]);

    var line = d3.svg.line()
                 .x(function(d) {
                    if (absyear == false){
                        return x(d.year);
                    }
                    return xTime(d.real_year)
                  })
                .y(function(d) {
                    return y(d.season_ff_pts);
                });

    d3.select("body").append("div").attr("id","seasonal_line");
    
    var svg = d3.select("#seasonal_line").append("svg")
                .attr("id","seasonal_line")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//  *****************************************************
//  MOVE SVG ITEM TO FRONT AND BACK
// ******************************************************
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

//  *****************************************************
//  GET DATA AND MANIPULATE IT
// ******************************************************
        var curid = []
        var startyear
        var cumpoints
        var numyears
        var avgcnt = []
        var avgpoints = []
        var avgjoe = {}
        var yearlist = []
        var season_dev = []
        var yeartuples = []
        var classtuples = []
        var playercnt = 0
        var playerstart = {}
        var classcnts = {}
        
        data.forEach(function(d) {
            d.guid = d.season_guid.split("_")[0]
                if (d.guid.indexOf('.') != -1) {
                    d.guid = d.guid.replace('.','');
                }
            d.year = +d.season_guid.split("_")[1]
            curyear = d.year
            d.real_year = d.year
//             d.year = d.season_guid.split("_")[1]
//             d.year = parseDate(d.year)
//             console.log(d)
            d.season_ff_pts = +d.season_ff_pts;
            if (d.year != 2015) {
                yeartuples.push([d.year, d.season_ff_pts]);
            }
            if (curid != d.guid){
                curid = d.guid
                startyear = +d.year
                playerstart["pguid"] = startyear
                numyears = 0
                cumpoints = 0
                playercnt++
                if (!(startyear in classcnts)) {
                    classcnts[startyear] = 0
                }
                classcnts[startyear]++ 
            }
        d.year -= (startyear - 1)
        numyears++
        classtuples.push([playerstart["pguid"], d.season_ff_pts])
        while (numyears != d.year){
            base = {"guid":d.guid, "year":numyears,
                    "real_year": parseDate(d.real_year.toString()),
                    "season_ff_pts":0}
            dataset.push(base);
//             if (avgpoints.length < numyears){
//                 avgpoints.push(0)
//                 avgcnt.push(0)
//             }
//             avgcnt[numyears-1] += 1
            numyears++
        }

        if (curyear != 2015){
            d.real_year = parseDate(d.real_year.toString())
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

    yeartuples.sort(function(a, b) {
        a = a[0];
        b = b[0];
        return a < b ? -1 : (a > b ? 1 : 0);
    });
    classtuples.sort(function(a, b) {
        a = a[0];
        b = b[0];
        return a < b ? -1 : (a > b ? 1 : 0);
    });
    var curyear = 0
    var yeartotals = []
    var yearcnts = []
    for (var i = 0; i < yeartuples.length; i++) {
        if (curyear != yeartuples[i][0]) {
            curyear = yeartuples[i][0]
            yeartotals.push([curyear,0])
            yearcnts.push(0)
        }
        index = yeartotals.length - 1
        runningsum = yeartotals[index][1] + yeartuples[i][1]
        yeartotals[index] = [curyear, runningsum]
        yearcnts[index] += 1
    }

    var curyear = 0
    var classtotals = []
    for (var i = 0; i < classtuples.length; i++) {
        if (curyear != classtuples[i][0]) {
            curyear = classtuples[i][0]
            classtotals.push([curyear,0])
        }
        index = classtotals.length - 1
        runningsum = classtotals[index][1] + classtuples[i][1]
        classtotals[index] = [curyear, runningsum]
    }
    console.log(classtotals)
    console.log(classcnts)
    for (var i = 0; i < yearlist.length; i++) {
        var stddev = math.std(yearlist[i])
        season_dev.push(stddev)
    }

    var season_dev2 = []
    var templist = []
    var curyear = yeartuples[0][0]
    for (var i = 0; i < yeartuples.length; i++) {
        if (curyear != yeartuples[i][0]){
            var stddev = math.std(templist)
            season_dev2.push(stddev)
            templist = []
            curyear = yeartuples[i][0]
        } else {
            templist.push(yeartuples[i][1])
        }
    }
    var stddev = math.std(templist)
    season_dev2.push(stddev)

    avgjoe.key = "AvgJoe"
    avgjoe.values = []    
    for (var i = 0; i < yearcnts.length; i++) {
        if (yearcnts[i] > 1){
            season_pts = Math.round(yeartotals[i][1]/yearcnts[i])
            year = parseDate(yeartotals[i][0].toString())
            avgjoe.values.push({"season_ff_pts":season_pts, "real_year":year})
        }
    }

    var avgjoe2 = {}
    avgjoe2.key = "AvgJoe2"
    avgjoe2.values = []
    prevyear = classtotals[0][0] - 1
    for (var i = 0; i < classtotals.length; i++) {
        year = classtotals[i][0]
        console.log(year, prevyear)
        season_pts = Math.round(classtotals[i][1]/classcnts[year])
        if (!(year == prevyear + 1)) {
            year = prevyear + 1
            season_pts = 0
            date = parseDate(year.toString())
            avgjoe2.values.push({"season_ff_pts":season_pts, "real_year":date})
        } else {
            date = parseDate(year.toString())
            avgjoe2.values.push({"season_ff_pts":season_pts, "real_year":date})
            prevyear = year
        }
    }

    console.log(avgjoe2)

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

    var goodguy2 = {}
    var eliteguy2 = {}
    goodguy2.key="GoodGuy2"
    eliteguy2.key="Elite2"
    goodguy2.values = []
    eliteguy2.values = []
    for (var i = 0; i < yearcnts.length; i++) {
        if (yearcnts[i] > 1){
            season_pts = Math.round(yeartotals[i][1]/yearcnts[i] + season_dev2[i])
            year = parseDate(yeartotals[i][0].toString())
            goodguy2.values.push({"season_ff_pts":season_pts, "real_year":year})
            season_pts = Math.round(yeartotals[i][1]/yearcnts[i] + 2*season_dev2[i])
            eliteguy2.values.push({"season_ff_pts":season_pts, "real_year":year})
        }
    }

    var dataGroup = d3.nest()
                      .key(function(d) {
                        return d.guid;
                      })
                     .entries(dataset);

    var keys = d3.keys(dataGroup);
    color.domain(d3.keys(dataGroup));


//  *****************************************************
//  BUILD AXIS
// ******************************************************
    var xAxis = d3.svg.axis()
                  .scale(xTime)
                  .orient("bottom");

    var yAxis = d3.svg.axis()
                  .scale(y)
                  .orient("left");

    x.domain(d3.extent(dataset, function(d) { return d.year; }));
    y.domain(d3.extent(dataset, function(d) { return d.season_ff_pts; }));
    xTime.domain(d3.extent(dataset, function(d) {return d.real_year;}));
//     x.domain([1,d3.max(dataset, function(d) { return d.year; })]);
//     y.domain([0,d3.max(dataset, function(d) { return d.season_ff_pts; })]);


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

//  *****************************************************
//  CIRCLES FOR DEATILS ON DEMANSD MOUSE HOVER
// ******************************************************
    var focus = svg.append("g")
                   .attr("class", "focus")
                   .style("display", "none");

    focus.append("circle")
         .attr("r", 4.5);

    focus.append("text")
         .attr("x", 9)
         .attr("dy", ".35em");


//  *****************************************************
//  PLACEHOLDERS FOR PLAYER SUMMARY STATISTICS
// ******************************************************

    var nameline = svg.append("g")
                      .attr("class", "details")

    var yearline = svg.append("g")
                      .attr("class", "details")

    var pointsline = svg.append("g")
                        .attr("class", "details")

    var averageline = svg.append("g")
                         .attr("class", "details")

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
    
//  *****************************************************
//  BUILD THE REFERENCE LINES
// ******************************************************
//     var area = d3.svg.area()
//                 .x(function(d) { return x(d.year); })
//                 .y0(height)
//                 .y1(function(d) { return y(d.close); });

     var area = d3.svg.area()
                  .x(function(d) {
                        return xTime(d.real_year)
                  })
                .y0(height)
                .y1(function(d) {
                        return y(d.season_ff_pts);
                    });

    var avgjoeline = svg.append("path")
                        .attr("class","distribution_lines")
                        .attr("id","avgjoeline")
//                         .attr("d",line(avgjoe.values))
                        .attr("d", area(avgjoe.values))
                        .attr("fill","steelblue")
//                         .style("stroke-width",2)
                        .style("stroke","black")
                        .text("Season")
//                         .on("mouseover", function() {
//                                 focus.style("display", null);
//                                 avgjoeline.style("stroke","indianred")
//                                 var sel = d3.select(this)
//                                 sel.moveToFront();
//                         })
//                         .on("mouseout", function() {
//                                 focus.style("display", "none");
//                                 avgjoeline.style("stroke","firebrick");
//                         });

//     var goodguyline = svg.append("path")
//                          .attr("class","distribution_lines")
//                          .attr("id","goodguyline")
//                          .attr("d",line(goodguy.values))
//                          .attr("fill","none")
//                          .style("opacity",0)
//                          .style("stroke-width",2)
//                          .style("stroke","seagreen")
//                          .on("mouseover", function() {
//                                 focus.style("display", null);
//                                 goodguyline.style("stroke","mediumseagreen")
//                                 var sel = d3.select(this)
//                                 sel.moveToFront();
//                          })
//                          .on("mouseout", function() {
//                                 focus.style("display", "none");
//                                 goodguyline.style("stroke","seagreen");
//                         });
//      var button_text = svg.append("text")
//                             .attr("dy", ".06em")
//                             .attr("y", -3)
//                             .attr("x", d3.select("#avgjoeline").)
//                             .attr("text-anchor", "middle")
//                             .style("stroke","black")
//                             .text("Class");
//     goodguyline.active = true
    avgjoeline.active = true

//  *****************************************************
//  BUTTONS TO TOGGLE THE REFERENCE LINE
// ******************************************************
    b_height = height+margin.bottom+margin.top;

    var yrtog = svg.append("rect")
                  .attr("class","button")
                  .attr("id","class_yr")
                  .attr("x", 20)
                  .attr("y", 10)
                  .attr("rx",25)
                  .attr("ry",25)
                  .attr("width", 150)
                  .attr("height", 100)
                  .attr("stroke","black")
                  .attr("fill","steelblue")
//                   .style("position","relative")
//                   .style("top",-24+"px")
//                   .style("right", width-350 +"px")
                  .text("Class")
                  .on("click",function(){
                      absyear = absyear ? false : true;
                      if (absyear) {
                        yrtog.text("Relative")
                        y.domain(d3.extent(avgjoe2, function(d) { return d.season_ff_pts; }));
                        svg.select("g.y.axis").call(yAxis)
                        d3.select("#avgjoeline").attr("d",area(avgjoe2.values))
//                         d3.select("#goodguyline").attr("d",line(goodguy2.values))
                      } else {
                            yrtog.text("Years")
                            y.domain(d3.extent(avgjoe, function(d) { return d.season_ff_pts; }));
                            svg.select("g.y.axis").call(yAxis)
                            d3.select("#avgjoeline").attr("d",area(avgjoe.values))
//                             d3.select("#goodguyline").attr("d",line(goodguy.values))


                      }
                  });
   }); //Close d3.json call
;  //not sure what this is about
} // Close function generateLineChart
