function generateLineChart(){

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
        var yeartuples = []

        data.results.forEach(function(d) {
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
                numyears = 0
                cumpoints = 0
            }
        d.year -= (startyear - 1)
        numyears++

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
    });
    
    yeartuples.sort(function(a, b) {
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
    for (var i = 0; i < avgcnt.length; i++) {
        if (avgcnt[i] > 1){
            season_pts = Math.round(avgpoints[i]/avgcnt[i])
            avgjoe.values.push({"season_ff_pts":season_pts, "year":i+1})
        }
    }

    var avgjoe2 = {}
    avgjoe2.key = "AvgJoe2"
    avgjoe2.values = []
    for (var i = 0; i < yearcnts.length; i++) {
        if (yearcnts[i] > 1){
            season_pts = Math.round(yeartotals[i][1]/yearcnts[i])
            year = parseDate(yeartotals[i][0].toString())
            avgjoe2.values.push({"season_ff_pts":season_pts, "real_year":year})
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
                  .scale(x)
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
//  BUILD THE LINE CHART
// ******************************************************
    dataGroup.forEach(function(d, i) {
        var iline = svg.append("path")
                       .attr("class", "playerlines")
                       .attr("id", d.key)
                       .attr("d", line(d.values))
                       .attr("fill","none")
                       .style('stroke-width', 3)
                       .style("stroke", "whitesmoke")
                       .on("click", function() {
                            color_attr = d3.select(this).style("stroke")
                            rgb = color_attr.split("(")[1].split(")")[0].split(",")
                            cfb= d3.rgb("cornflowerblue")
                            if (+rgb[0]==cfb.r && +rgb[1]==cfb.g && +rgb[2]==cfb.b) {
                                console.log(iline)
                                iline.style("stroke","whitesmoke");                            
                            } else {
                                iline.style("stroke","cornflowerblue");
                            }
                       })
                       .on("mouseover", function() {
                            focus.style("display", null);
//                             iline.style("stroke","steelblue")
                            var sel = d3.select(this);
                            sel.moveToFront();
                            color_attr = d3.select(this).style("stroke")
                            cfb= d3.rgb("cornflowerblue")
                            rgb = color_attr.split("(")[1].split(")")[0].split(",")
                            if (+rgb[0]==cfb.r && +rgb[1]==cfb.g && +rgb[2]==cfb.b) {
                                iline.style("stroke","cornflowerblue");                            
                            } else {
                                iline.style("stroke","steelblue");
                            }

                        })
                      .on("mouseout", function() {
                            focus.style("display", "none");
//                             iline.style("stroke","whitesmoke");
                            var sel = d3.select(this);
                            color_attr = d3.select(this).style("stroke")
                            cfb= d3.rgb(selected_color)
                            rgb = color_attr.split("(")[1].split(")")[0].split(",")
                            if (+rgb[0]==cfb.r && +rgb[1]==cfb.g && +rgb[2]==cfb.b) {
                                iline.style("stroke", selected_color);                            
                            } else {
                                iline.style("stroke","whitesmoke");
                                sel.moveToBack();
                            }

                        })
                      .on("mousemove", function(){
                            if (absyear == true) {
                                var rawX = xTime.invert(d3.mouse(this)[0])
                                var year = rawX.getFullYear()
                                relyear = year - d.values[0].real_year.getFullYear()
                                var pts = d.values[relyear].season_ff_pts
                                var yr_date = parseDate(year.toString())
                            } else {
                                var rawX = x.invert(d3.mouse(this)[0])
                                var year = Math.round(rawX)
                                var pts = d.values[year-1].season_ff_pts
                            }
                            var totpts = 0
                            var totyears = d.values.length
                            var bestyr = -10000
                            var worstyr = 10000
                            for (var i = 0; i < totyears; i++) {
                                totpts += d.values[i].season_ff_pts
                                if (d.values[i].season_ff_pts > bestyr) {
                                    bestyr = d.values[i].season_ff_pts
                                }
                                if (d.values[i].season_ff_pts < worstyr) {
                                    worstyr = d.values[i].season_ff_pts
                                }
                            }
                            var avg = Math.round(totpts/totyears)
                            if (absyear == true) {
                                focus.attr("transform", "translate(" + xTime(yr_date) + "," + y(pts) + ")")
                            } else {
                                focus.attr("transform", "translate(" + x(year) + "," + y(pts) + ")")
                            }
                            focus.select("text").text(d.key+"\n  Year: "+year+"\n  Pts:"+pts);
                            focus.moveToFront();
                            nameline.select("text").text("Name: " + d.key);
                            yearline.select("text").text("Years: " + totyears);
                            pointsline.select("text").text("Total Points: " + totpts);
                            averageline.select("text").text("Average/Season: " + avg + " (Best: "+bestyr+", Worst: " + worstyr+")");
                        });

    });
    
    dispatch.on("lasso", function(lassoed_items) {
        if(lassoed_items.length > 0){
            lassoed_items.forEach(function(d){
                d3.select('path#'+d.pguid)
                  .style("stroke", selected_color);
            });
        } else {
            
        }
    });
//  *****************************************************
//  BUILD THE REFERENCE LINES
// ******************************************************
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

//  *****************************************************
//  BUTTONS TO TOGGLE THE REFERENCE LINE
// ******************************************************
    b_height = height+margin.bottom+margin.top;


    var d_button = d3.select("#average")
    // d3.select("#seasonal_line").append("button")
    //                  .attr("class","button")
    //                  .style("position","relative")
    //                  .style("left", -width-20+"px")
    //                  .text("Average Player")
                     .on("click",function(){
                            var active = avgjoeline.active ? false : true;
                            var opacity = active ? 0 : 1;
                            d3.select("#avgjoeline").style("opacity", opacity);
                            avgjoeline.active = active;
                     });

    // d3.select("#seasonal_line").append("button")
    //                  .attr("class","button")
    //                  .style("position","relative")
    //                  .style("left", -width+"px")
    //                  .style("width","60px")
    //                  .text("Good")
    d3.select("#good")
                     .on("click",function(){
                            var active = goodguyline.active ? false : true;
                            var opacity = active ? 0 : 1;
                            d3.select("#goodguyline").style("opacity", opacity);
                            goodguyline.active = active;
                     });

    // d3.select("#seasonal_line").append("button")
    //                  .attr("class","button")
    //                  .style("position","relative")
    //                 //  .style("top",-24+"px")
    //                  .style("left", -width + 20+"px")
    //                  .style("width","60px")
    //                  .text("Elite")
    d3.select("#elite")
                     .on("click",function(){
                            var active = eliteguyline.active ? false : true;
                            var opacity = active ? 0 : 1;
                            d3.select("#eliteguyline").style("opacity", opacity);
                            eliteguyline.active = active;
                     });

    var yrtog = d3.select("#year")
    // d3.select("#seasonal_line").append("button")
    //               .attr("class","button")
    //               .style("position","relative")
    //               // .style("top",-24+"px")
    //               .style("right", width +"px")
    //               .text("Years")
                  .on("click",function(){
                      absyear = absyear ? false : true;
                      if (absyear) {
                        yrtog.text("Relative")
                        xAxis.scale(xTime);
                        svg.selectAll("g .x.axis")
                           .call(xAxis);
                        var sel = d3.select("body").transition();
                        dataGroup.forEach(function(d, i) {
                            sel.select("#"+d.key)
                               .duration(1500)
                               .attr("d",line(d.values))
                        });
                        d3.select("#avgjoeline").attr("d",line(avgjoe2.values))
                        d3.select("#goodguyline").attr("d",line(goodguy2.values))
                        d3.select("#eliteguyline").attr("d",line(eliteguy2.values))
                      } else {
                            yrtog.text("Years")
                            xAxis.scale(x);
                            svg.selectAll("g .x.axis")
                               .call(xAxis);
                            var sel = d3.select("body").transition();
                                dataGroup.forEach(function(d, i) {
                                    sel.select("#"+d.key)
                                       .duration(1500)
                                       .attr("d",line(d.values))
                            });
                            d3.select("#avgjoeline").attr("d",line(avgjoe.values))
                            d3.select("#goodguyline").attr("d",line(goodguy.values))
                            d3.select("#eliteguyline").attr("d",line(eliteguy.values))

                      }
                  });
   }); //Close d3.json call
;  //not sure what this is about
} // Close function generateLineChart
