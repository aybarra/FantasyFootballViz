function generateLineChart(data) {
    var temp_data = jQuery.extend(true, {}, data);
    var seasonal_data = []
    for (var key in temp_data) {
        seasonal_data.push(temp_data[key])
    }

    var season_seasonal_dataset = [];
    var selected_color = "cornflowerblue"
    var parseDate = d3.time.format("%Y").parse;
    var color = d3.scale.category10();


    var margin = { top: 15, right: 35, bottom: 55, left: 45 }

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

    var svg = d3.select("#sm-sec-3").append("svg")
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

// NOTE: THE seasonal_data MANIPULATION FROM HERE HAS BEEN MOVED

    var avgjoe = {}
    var season_dev = []
    seasonal_dataStuff = Handleseasonal_data(seasonal_data)
    season_seasonal_dataset = seasonal_dataStuff[0]
    yeartuples = seasonal_dataStuff[1]
    avgcnt = seasonal_dataStuff[2]
    avgpoints = seasonal_dataStuff[3]
    yearlist = seasonal_dataStuff[4]

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
//     console.log(yeartuples)
    var season_dev2 = []
    var templist = []
    var curyear = yeartuples[0][0]
    for (var i = 0; i < yeartuples.length; i++) {
        if (curyear != yeartuples[i][0]){
             if (templist.length < 1) {templist.push(0);}
            var stddev = math.std(templist)
            season_dev2.push(stddev)
            templist = []
            curyear = yeartuples[i][0]
        } else {
            templist.push(yeartuples[i][1])
        }
    }
    if (templist.length < 1) {templist.push(0);}
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

    var season_seasonal_dataGroup = d3.nest()
                      .key(function(d) {
                        return d.guid;
                      })
                     .entries(season_seasonal_dataset);

    var keys = d3.keys(season_seasonal_dataGroup);
    color.domain(d3.keys(season_seasonal_dataGroup));


//  *****************************************************
//  BUILD AXIS
// ******************************************************
//     var formatxAxis = d3.format('.0f');

    var xAxis = d3.svg.axis()
                  .scale(x)
//                   .tickFormat(formatxAxis)
                  .orient("bottom");

    var yAxis = d3.svg.axis()
                  .scale(y)
                  .orient("left");



    x.domain(d3.extent(season_seasonal_dataset, function(d) { return d.year; }));
//     y.domain(d3.extent(season_seasonal_dataset, function(d) { return d.season_ff_pts; }));
    xTime.domain(d3.extent(season_seasonal_dataset, function(d) {return d.real_year;}));
//     x.domain([1,d3.max(season_seasonal_dataset, function(d) { return d.year; })]);
    y.domain([-10,d3.max(season_seasonal_dataset, function(d) { return d.season_ff_pts; })]);
    minmax = d3.extent(season_seasonal_dataset, function(d) {return d.real_year})
    range = minmax[1].getFullYear() - minmax[0].getFullYear()
    xAxis.ticks(range)

    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis);

    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis)
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", -41)
       .attr("x", -30)
       .attr("dy", ".71em")
       .style("text-anchor", "end")
       .text("Seasonal Fantasy Points");

      //  svg.append("text")
      //      .attr("id","title")
      //      .attr("x", 150)
      //      .attr("y", 0 - (margin.top / 3))
      //      .attr("text-anchor", "middle")
      //      .style("font-size", "16px")
      //      .style("text-decoration", "underline")
      //      .text("Per Season Fantasy Points");

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
         .attr("dy", ".35em")
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
            .attr("id","nameline")
            .attr("x", 50)
            .attr("y", height+margin.bottom-20)
            .style("font-size", "10px")

    yearline.append("text")
            .attr("id","yearline")
            .attr("x", 35)
            .attr("y", height+margin.bottom-10)
            .style("font-size", "10px")

    pointsline.append("text")
            .attr("id","pointsline")
            .attr("x", 15)
              .attr("y", height+margin.bottom)
            .style("font-size", "10px")

    averageline.append("text")
            .attr("id","averageline")
            .attr("x", 9)
               .attr("y", height+margin.bottom)
              .style("font-size", "10px")

    svg.append("text")
        .attr("id","seasonaltitle")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 3) + 5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Player Points / Season");

//  *****************************************************
//  BUILD THE LINE CHART
// ******************************************************
    season_seasonal_dataGroup.forEach(function(d, i) {
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
                            nameline.select("text").text("Name: " + PGUID_TO_NAME_MAP[d.key][0]);
                            yearline.select("text").text("Years: " + totyears + "......  Total Points: " + totpts);
//                             pointsline.select("text").text("Total Points: " + totpts);
                            averageline.select("text").text("Average/Season: " + avg + " (Best: "+bestyr+", Worst: " + worstyr+")");
                            d3.select("#nameline").moveToFront()
                            d3.select("#yearline").moveToFront()
                            d3.select("#pointsline").moveToFront()
                            d3.select("#averageline").moveToFront()
                        });

    });

    dispatch.on("lasso_seasonal", function(lassoed_items) {
        if(lassoed_items.length > 0){
            lassoed_items.forEach(function(d){
                var item = d3.select('path#'+d.pguid)
                
                item.style("stroke", selected_color);
                item.moveToFront();

            });
        } else {
                d3.selectAll('path.playerlines')
                  .style("stroke", "whitesmoke");
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

        svg.append("rect")
                  .attr("class","button")
                  .attr("id","avgbut")
                  .attr("x", width-margin.right)
                  .attr("y", height+10)
                  .attr("rx",width/30)
                  .attr("ry",height/30)
                  .attr("width", width/10)
                  .attr("height", height/15)
                  .attr("stroke","black")
                  .attr("fill","firebrick")
                  .on("click",function(){
                        var active = avgjoeline.active ? false : true;
                        var opacity = active ? 0 : 1;
                        d3.select("#avgjoeline").style("opacity", opacity);
                        avgjoeline.active = active;
                     });

        svg.append("rect")
                  .attr("class","button")
                  .attr("id","goodbut")
                  .attr("x", width-margin.right)
                  .attr("y", height+20)
                  .attr("rx",width/30)
                  .attr("ry",height/30)
                  .attr("width", width/10)
                  .attr("height", height/15)
                  .attr("stroke","black")
                  .attr("fill","seagreen")
                     .on("click",function(){
                            var active = goodguyline.active ? false : true;
                            var opacity = active ? 0 : 1;
                            d3.select("#goodguyline").style("opacity", opacity);
                            goodguyline.active = active;
                     });

        svg.append("rect")
                  .attr("class","button")
                  .attr("id","elitebut")
                  .attr("x", width-margin.right)
                  .attr("y", height+30)
                  .attr("rx",width/30)
                  .attr("ry",height/30)
                  .attr("width", width/10)
                  .attr("height", height/15)
                  .attr("stroke","black")
                  .attr("fill","salmon")
                     .on("click",function(){
                            var active = eliteguyline.active ? false : true;
                            var opacity = active ? 0 : 1;
                            d3.select("#eliteguyline").style("opacity", opacity);
                            eliteguyline.active = active;
                     });

        var relbutton = svg.append("rect")
                  .attr("class","button")
                  .attr("id","relabs")
                  .attr("x", width - margin.right)
                  .attr("y", 10)
                  .attr("rx",width/30)
                  .attr("ry",height/30)
                  .attr("width", width/10)
                  .attr("height", height/15)
                  .attr("stroke","black")
                  .attr("fill","yellow")
                  .on("click",function(){
                      absyear = absyear ? false : true;
                      if (absyear) {
                        relbutton.text("Relative")
//                         xAxis.tickFormat(null)
                        xAxis.scale(xTime)
                            .ticks(d3.time.year)

                        svg.selectAll("g .x.axis")
                            .transition().duration(1000)
                           .call(xAxis);
                        var sel = d3.select("body").transition();
                        season_seasonal_dataGroup.forEach(function(d, i) {
                            sel.select("#"+d.key)
                               .duration(1500)
                               .attr("d",line(d.values))
                        });
                        d3.select("#avgjoeline").attr("d",line(avgjoe2.values))
                        d3.select("#goodguyline").attr("d",line(goodguy2.values))
                        d3.select("#eliteguyline").attr("d",line(eliteguy2.values))
                        d3.select("#title").text("Average Points / Class");


                      } else {
                            relbutton.text("Years")
//                             xAxis.tickFormat(formatxAxis)
                            xAxis.scale(x)
                                .ticks(range)
                            svg.selectAll("g .x.axis")
                                .transition().duration(1000)
                               .call(xAxis);
                            var sel = d3.select("body").transition();
                                season_seasonal_dataGroup.forEach(function(d, i) {
                                    sel.select("#"+d.key)
                                       .duration(1500)
                                       .attr("d",line(d.values))
                            });
                            d3.select("#avgjoeline").attr("d",line(avgjoe.values))
                            d3.select("#goodguyline").attr("d",line(goodguy.values))
                            d3.select("#eliteguyline").attr("d",line(eliteguy.values))
                            d3.select("#title").text("Average Points / Season");

                      }
                  });
;  //not sure what this is about
} // Close function generateLineChart

function Handleseasonal_data(seasonal_data) {
//  *****************************************************
//  GET seasonal_data AND MANIPULATE IT
// ******************************************************
    var season_seasonal_dataset = []
    var curid = []
    var startyear
    var numyears
    var avgcnt = []
    var avgpoints = []
    var yearlist = []
    var yeartuples = []
    var parseDate = d3.time.format("%Y").parse;
    seasonal_data.forEach(function(d) {
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
        }
        d.year -= (startyear - 1)
        numyears++

        while (numyears != d.year){
            base = {"guid":d.guid, "year":numyears,
                    "real_year": parseDate((startyear+numyears-1).toString()),
                    "season_ff_pts":0}
            season_seasonal_dataset.push(base);
    //             if (avgpoints.length < numyears){
    //                 avgpoints.push(0)
    //                 avgcnt.push(0)
    //             }
    //             avgcnt[numyears-1] += 1
            numyears++
        }
        if (curyear != 2015) {
            d.real_year = parseDate(d.real_year.toString())
            season_seasonal_dataset.push(d);
            if (avgpoints.length < numyears) {
                avgpoints.push(0)
                avgcnt.push(0)
                yearlist.push([])
            }
            avgpoints[numyears-1] += d.season_ff_pts
            avgcnt[numyears-1] += 1
            yearlist[numyears-1].push(d.season_ff_pts)
        }
    }); //end seasonal_data loading
    return [season_seasonal_dataset, yeartuples, avgcnt, avgpoints, yearlist]
}