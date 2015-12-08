function generateHistoryLine(data){
    var temp_data = jQuery.extend(true, {}, data);
    var history_data = []
    for (var key in temp_data) {
        history_data.push(temp_data[key])
    }

    var history_dataset = [];
    var selected_color = "cornflowerblue"
    var parseDate = d3.time.format("%Y").parse;
    var color = d3.scale.category10();

    var margin = { top: 40, right: 30, bottom: 33, left: 45 }

        , width = parseInt(d3.select('.small-chart').style('width'), 10)
        , width = width - margin.left - margin.right
        , height = parseInt(d3.select('.small-chart').style('height'), 10)
        , height = height - margin.top - margin.bottom;

    var absyear = false;

    var xTime = d3.time.scale()
                  .range([0, width]);

    var x = d3.scale.linear()
              .range([0, width]);

    var y = d3.scale.linear()
              .range([height, 0]);

    var relx = d3.scale.linear()
               .range([0, width+margin.left+margin.right])
               .domain([0,100])

    var rely = d3.scale.linear()
              .range([height+margin.top+margin.bottom, 0])
              .domain([0,100])


    var line = d3.svg.line()
                 .x(function(d) {
                    return xTime(d.real_year)
                  })
                .y(function(d) {
                    return y(d.season_ff_pts);
                });

//     d3.select("body").append("div").attr("id","seasonal_line");

    var svg = d3.select("#sm-sec-2").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//  *****************************************************
//  MOVE SVG ITEM TO FRONT AND BACK
// ******************************************************
//     d3.selection.prototype.moveToFront = function() {
//         return this.each(function(){
//             this.parentNode.appendChild(this);
//         });
//     }
//
//     d3.selection.prototype.moveToBack = function() {
//         return this.each(function() {
//             var firstChild = this.parentNode.firstChild;
//                 if (firstChild) {
//                     this.parentNode.insertBefore(this, firstChild);
//                 }
//         });
//     };

//  *****************************************************
//  GET history_data AND MANIPULATE IT
// ******************************************************
        var curid = []
        var startyear
        var cumpoints
        var numyears
        var avgcnt = []
        var avgpoints = []
        var groupavg = {}
        var yearlist = []
        var season_dev = []
        var yeartuples = []
        var classtuples = []
        var playercnt = 0
        var playerstart = {}
        var classcnts = {}

    history_data.forEach(function(d) {
        d.guid = d.season_guid.split("_")[0]
            if (d.guid.indexOf('.') != -1) {
                d.guid = d.guid.replace('.','');
            }
        d.year = +d.season_guid.split("_")[1]
        curyear = d.year
        d.real_year = d.year
//             d.year = d.season_guid.split("_")[1]
//             d.year = parseDate(d.year)
//             //console.log(d)
        d.season_ff_pts = +d.season_ff_pts;
        if (d.year != 2015) {
            yeartuples.push([d.year, d.season_ff_pts]);
        }
        if (curid != d.guid){
            curid = d.guid
            startyear = +d.year
            playerstart[curid] = startyear
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
        classtuples.push([playerstart[curid], d.season_ff_pts])
        while (numyears != d.year){
            base = {"guid":d.guid, "year":numyears,
                    "real_year": parseDate((startyear+numyears-1).toString()),
                    "season_ff_pts":0}
            history_dataset.push(base);
    //             if (avgpoints.length < numyears){
    //                 avgpoints.push(0)
    //                 avgcnt.push(0)
    //             }
    //             avgcnt[numyears-1] += 1
            numyears++
        }

        if (curyear != 2015){
            d.real_year = parseDate(d.real_year.toString())
            history_dataset.push(d);
            if (avgpoints.length < numyears) {
                avgpoints.push(0)
                avgcnt.push(0)
                yearlist.push([])
            }
            avgpoints[numyears-1] += d.season_ff_pts
            avgcnt[numyears-1] += 1
            yearlist[numyears-1].push(d.season_ff_pts)
        }
    }) //end history_data.foreach Loop

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
//     console.log(yeartuples)
//     console.log(classtuples)
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
    //console.log(classtuples)
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
    //console.log(classtotals)
    //console.log(classcnts)

    groupavg.key = "groupavg"
    groupavg.values = []
    for (var i = 0; i < yearcnts.length; i++) {
            season_pts = Math.round(yeartotals[i][1]/yearcnts[i])
            year = parseDate(yeartotals[i][0].toString())
            groupavg.values.push({"season_ff_pts":season_pts, "real_year":year})
    }

    var groupavg2 = {}
    groupavg2.key = "groupavg2"
    groupavg2.values = []
    prevyear = classtotals[0][0] - 1
    for (var i = 0; i < classtotals.length; i++) {
        year = classtotals[i][0]
        //console.log(year, prevyear)
        season_pts = Math.round(classtotals[i][1]/classcnts[year])
        if (!(year == prevyear + 1)) {
            year = prevyear + 1
            season_pts = 0
            date = parseDate(year.toString())
            groupavg2.values.push({"season_ff_pts":season_pts, "real_year":date})
        } else {
            date = parseDate(year.toString())
            groupavg2.values.push({"season_ff_pts":season_pts, "real_year":date})
            prevyear = year
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
            season_pts = Math.round(groupavg.values[i].season_ff_pts + season_dev[i])
            goodguy.values.push({"season_ff_pts":season_pts, "year":i+1})
            season_pts = Math.round(groupavg.values[i].season_ff_pts + (2*season_dev[i]))
            eliteguy.values.push({"season_ff_pts":season_pts, "year":i+1})
        }
    }

//  *****************************************************
//  BUILD AXIS
// ******************************************************
    var xAxis = d3.svg.axis()
                  .scale(xTime)
                  .ticks(d3.time.year)
                  .orient("bottom");

    var yAxis = d3.svg.axis()
                  .scale(y)
                  .tickFormat(d3.format("d"))
                  .orient("left");

//     x.domain(d3.extent(history_dataset, function(d) { return d.year; }));
    y.domain(d3.extent(groupavg.values, function(d) { return d.season_ff_pts; }));
    xTime.domain(d3.extent(groupavg.values, function(d) {return d.real_year;}))

//     x.domain([1,d3.max(history_dataset, function(d) { return d.year; })]);
//     y.domain([0,d3.max(history_dataset, function(d) { return d.season_ff_pts; })]);


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
       .attr("x", -30)
       .attr("dy", ".71em")
       .style("text-anchor", "end")
       .text("Seasonal Fantasy Points");

//  *****************************************************
//  CIRCLES FOR DEATILS ON DEMANSD MOUSE HOVER
// ******************************************************
    var focus = svg.append("g")
                   .attr("class", "historyfocus")
                   .style("display", "none");

    focus.append("circle")
         .attr("r", 3)
         .attr("stroke","black")

    focus.append("text")
         .attr("id","historyfocusyear")
         .attr("x", -5)
         .attr("dy", "-2.5em")
         .style("font-size", "10px")

    focus.append("text")
         .attr("id","historyfocusplayers")
         .attr("x", -5)
         .attr("dy", "-1.5em")
         .style("font-size", "10px")

    focus.append("text")
         .attr("id","historyfocuspoints")
         .attr("x", -5)
         .attr("dy", "-.5em")
         .style("font-size", "10px")

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
    svg.append("text")
        .attr("id","historytitle")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style( "font-size", "16px" )
        .style("text-decoration", "underline")
        .text("Average Points / Season");

    var histavgline = svg.append("path")
                        .attr("class","distribution_lines")
                        .attr("id","historyline")
                        .attr("d", area(groupavg.values))
                        .attr("fill","lightblue")
                        .style("stroke","black")
                       .on("mouseover", function() {
                            focus.style("display", null);
                        })
                      .on("mouseout", function() {
                            focus.style("display", "none");
                        })
                      .on("mousemove", function(){
                           focus.moveToFront();
                            var rawX = xTime.invert(d3.mouse(this)[0])
                            var year = rawX.getFullYear()
                            var year_str = parseDate(year.toString())
                            var pts
                            var cnts
                            if (absyear == false) {
                                for (var i = 0; i < groupavg.values.length; i++ ) {
                                    grp_year = groupavg.values[i].real_year.getFullYear()
                                    if (grp_year == year) { break }
                                }
                                pts = groupavg.values[i].season_ff_pts
                                cnts = yearcnts[i]
                                y.domain(d3.extent(groupavg.values, function(d) { return d.season_ff_pts; }));

                            } else {
                                for (var j = 0; j < groupavg2.values.length; j++ ) {
                                    grp_year = groupavg2.values[j].real_year.getFullYear()
                                    if (grp_year == year) { break }
                                }
                                pts = groupavg2.values[j].season_ff_pts
                                cnts = classcnts[year]
                                y.domain(d3.extent(groupavg2.values, function(d) { return d.season_ff_pts; }));
                            }
                            focus.attr("transform", "translate(" + xTime(year_str) + "," + y(pts) + ")")

//                             var pts = d.values[year-1].season_ff_pts
                            var message
                            message = absyear ? "Class of " : "Year: "
                            focus.select("#historyfocusyear").text(message+year)
                            focus.select("#historyfocusplayers").text("Plyrs: " + cnts)
                            focus.select("#historyfocuspoints").text("Avg Pts:" + pts);
                        })


//  *****************************************************
//  BUTTONS TO TOGGLE THE REFERENCE LINE
// ******************************************************
    b_height = height+margin.bottom+margin.top;
    var button_left = 20
    var button_top = 10

    var reltext = svg.append("text")
                    .attr("x", relx(1))
                    .attr("y", rely(100))
                    .style("font-size", "10px")
                    .text("Toggle Year")

    svg.append("rect")
          .attr("class","history_button")
          .attr("id","historyavgbut")
          .attr("x", relx(1))
          .attr("y", rely(98))
          .attr("rx",relx(1))
          .attr("ry",rely(1))
          .attr("width", relx(5))
          .attr("height", rely(96.5))
          .attr("stroke","black")
          .attr("fill","white")
          .on("click",function(){
              absyear = absyear ? false : true;
              var fillcol = absyear ? "black" : "white"
              if (absyear) {
                y.domain(d3.extent(groupavg2.values, function(d) { return d.season_ff_pts; }));
                svg.selectAll("g .y.axis").call(yAxis);
                xTime.domain(d3.extent(groupavg2.values, function(d) {return d.real_year;}))
                svg.selectAll("g .x.axis").call(xAxis);
                d3.select("#historyline").attr("d",area(groupavg2.values))
                svg.select("#historytitle").text("Average Points / Class");
                d3.select(this).attr("fill",fillcol)
              } else {
                y.domain(d3.extent(groupavg.values, function(d) { return d.season_ff_pts; }));
                svg.selectAll("g .y.axis").call(yAxis);
                xTime.domain(d3.extent(groupavg.values, function(d) {return d.real_year;}))
                svg.selectAll("g .x.axis").call(xAxis);
                d3.select("#historyline").attr("d",area(groupavg.values))
                svg.select("#historytitle").text("Average Points / Year")
                d3.select(this).attr("fill",fillcol)
              }
      });


;  //not sure what this is about
} // Close function generateLineChart


function updateHistoryLine( updatedData ){
  d3.select(".distribution_lines").remove();
  d3.select("#sm-sec-2 svg").remove();

  generateHistoryLine( updatedData );

}
