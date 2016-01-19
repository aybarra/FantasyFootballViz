function generateLineChart(data) {

    var default_line_color = d3.hsl('#dddddd');

    var temp_data = jQuery.extend(true, {}, data);
    var seasonal_data = []
    for (var key in temp_data) {
        seasonal_data.push(temp_data[key])
    }

    var season_seasonal_dataset = [];
    var selected_color = "cornflowerblue"
    var parseDate = d3.time.format("%Y").parse;
    var color = d3.scale.category10();


    var margin = { top: 45, right: 35, bottom: 65, left: 45 }

        , width = parseInt(d3.select('.small-chart').style('width'), 10)
        , width = width - margin.left - margin.right
        , height = parseInt(d3.select('.small-chart').style('height'), 10)
        , height = height - margin.top - margin.bottom;

    var absyear = false;

    var xTime = d3.time.scale()
                  .range([0, width]);

    var x = d3.scale.linear()
              .range([0, width]);

    var relx = d3.scale.linear()
               .range([0, width+margin.left+margin.right])
               .domain([0,100])

    var y = d3.scale.linear()
              .range([height, 0]);

    var rely = d3.scale.linear()
              .range([height+margin.top+margin.bottom, 0])
              .domain([0,100])

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
    var curyear = 0
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
                  .tickFormat(d3.format("d"))
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
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      //  .attr("transform", "rotate(-90)")
      //  .attr("y", -41)
      //  .attr("x", -30)
      //  .attr("dy", ".71em")
      //  .style("text-anchor", "end")
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
//  CIRCLES FOR DETAILS ON DEMAND MOUSE HOVER
// ******************************************************
    var focus = svg.append("g")
                   .attr("class", "focus")
                   .style("display", "none");

    focus.append("circle")
         .attr("r", 4.5);

    focus.append("text")
         .attr("id","focusname")
         .attr("x", 9)
         .attr("dy", "-1.5em")
         .style("font-size", "10px")

    focus.append("text")
         .attr("id","focusyear")
         .attr("x", 9)
         .attr("dy", "-.5em")
         .style("font-size", "10px")

    focus.append("text")
         .attr("id","focuspoints")
         .attr("x", 9)
         .attr("dy", ".5em")
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
            .attr("x", relx(0))
            // .attr("y", rely(17))
            .attr("y", rely(30))
            .style("font-size", "10px")

    yearline.append("text")
            .attr("id","yearline")
            .attr("x", relx(0))
            // .attr("y", rely(12))
            .attr("y", rely(25))
            .style("font-size", "10px")

    pointsline.append("text")
            .attr("id","pointsline")
            .attr("x", relx(1))
              // .attr("y", height+margin.bottom)
            .attr("y", 25)
            .style("font-size", "10px")

    averageline.append("text")
            .attr("id","averageline")
            .attr("x", relx(0))
              //  .attr("y", rely(7))
            .attr("y", rely(20))
              .style("font-size", "10px")

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
                            var splice_index = selected_pguids.indexOf(d.key);
                            if(splice_index == -1){
                              // Add it because you clicked it
                              console.log("Added from seasonal");
                              selected_pguids.push(d.key);
                            } else {
                              // Remove it because you double clicked it
                              // console.log("Removing pguid: " + d.key);
                              // console.log(selected_pguids);
                              // console.log("Removing index: " + splice_index);
                              // console.log(splice_index);
                              console.log("Removed from seasonal");
                              selected_pguids.splice(splice_index, 1);
                              // console.log(selected_pguids);
                            }

                            color_attr = d3.select(this).style("stroke")
                            rgb = color_attr.split("(")[1].split(")")[0].split(",")
                            colorcheck = CheckColor(color_attr)
//                             console.log(colorcheck)
                            var sel = d3.select(this);
                            if (colorcheck == 'red') {
                                    sel.style("stroke", "firebrick")
                            }
                            if (colorcheck == 'blue') {
                                    sel.style("stroke", "cornflowerblue")
                            }
                            if (colorcheck == 'orange') {
                                    sel.style("stroke", "sandybrown")
                            }
                            if (colorcheck == 'green') {
                                    sel.style("stroke", "limegreen")
                            }
                            if (colorcheck == 'cornflowerblue' ||
                                colorcheck == 'sandybrown' ||
                                colorcheck == 'limegreen' ||
                                colorcheck == 'firebrick') {
                                    sel.style("stroke", "whitesmoke")
                            }

                            // Notifies everyone else to highlight/unhighlight
                            dispatch.project_click();
                       })
                       .on("mouseover", function() {
                            focus.style("display", null);
                            color_attr = d3.select(this).style("stroke")
                            color = colorScale(PGUID_TO_NAME_MAP[d.key][1])
//                             console.log(color)
                            var sel = d3.select(this);
                            sel.moveToFront();
                            sel.transition().duration(100)
                                .ease("bounce")
                                .style("stroke-width", "9px")
                            colorcheck = CheckColor(color_attr)
                            if (!(colorcheck == 'cornflowerblue' ||
                                colorcheck == 'sandybrown' ||
                                colorcheck == 'limegreen' ||
                                colorcheck == 'firebrick')) {
                                    sel.style('stroke', color)                                
                            }
                        })
                      .on("mouseout", function() {
                            focus.style("display", "none");
//                             iline.style("stroke","whitesmoke");
                            var sel = d3.select(this);
                            sel.transition().duration(100)
                                .ease("bounce").style("stroke-width", "2px")
                            color_attr = d3.select(this).style("stroke")
                            cfb= d3.rgb(selected_color)
                            rgb = color_attr.split("(")[1].split(")")[0].split(",")
                            colorcheck = CheckColor(color_attr)
                            if (!(colorcheck == 'cornflowerblue' ||
                                colorcheck == 'sandybrown' ||
                                colorcheck == 'limegreen' ||
                                colorcheck == 'firebrick')) {
                                    sel.style('stroke', "whitesmoke")
                                    sel.moveToBack()
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
                            fullname = PGUID_TO_NAME_MAP[d.key][0]
                            focus.select("#focusname").text(fullname);
                            focus.select("#focusyear").text("Yr: "+year);
                            focus.select("#focuspoints").text("Pts:"+pts);
                            focus.moveToFront();
                            nameline.select("text").text("Name: " + fullname);
                            yearline.select("text").text("Years: " + totyears + "......  Total Points: " + totpts);
//                             pointsline.select("text").text("Total Points: " + totpts);
                            averageline.select("text").text("Average/Season: " + avg + " (Best: "+bestyr+", Worst: " + worstyr+")");
                            d3.select("#nameline").moveToFront()
                            d3.select("#yearline").moveToFront()
                            d3.select("#pointsline").moveToFront()
                            d3.select("#averageline").moveToFront()
                        });

    });


    // dispatch.on("lasso_seasonal", function(lassoed_items) {
    //     if(lassoed_items.length > 0){
    //         lassoed_items.forEach(function(d){
    //             var item = d3.select('path#'+d.pguid)


    dispatch.on("lasso.seasonal", function() {
        // if(selected_pguids.length > 0){
        //     selected_pguids.forEach(function(d){
        //         var item = d3.select('path#'+d);
        //         item.style("stroke", selected_color);
        //         item.moveToFront();
        //     });
        // } else {
        //         d3.selectAll('path.playerlines')
        //           .style("stroke", "whitesmoke");
        // }
        if(selected_pguids.length > 0){
          selected_pguids.forEach(function (d){
            // TODO Do something about the name's T.J, etc...
            var key_updated = getUpdatedKey(d.toString());
            d3.select("#" + key_updated);
            var position = PGUID_TO_NAME_MAP[d][1];
            var correct_color;
            if ( position == 'qb') {
              correct_color = "cornflowerblue";
            } else if ( position == 'wr') {
              correct_color = "sandybrown";
            } else if ( position == 'te') {
              correct_color = "limegreen";
            } else if ( position == 'rb') {
              correct_color = "firebrick";
            }
            var sel = d3.select('#' + key_updated)
              .style("stroke", correct_color);
            sel.moveToFront();
          });
      } else {
        var paths = d3.selectAll("path.playerlines");
        paths.style('stroke', default_line_color);
      }
    });

    dispatch.on("project_click.seasonal", function() {
        // if(selected_pguids.length > 0){
        //     selected_pguids.forEach(function(d){
        //         var item = d3.select('path#'+d);
        //         item.style("stroke", colorScale(PGUID_TO_NAME_MAP[d][1]));
        //         item.moveToFront();
        //     });
        // } else {
        //         d3.selectAll('path.playerlines')
        //           .style("stroke", "whitesmoke");
        // }

        if(selected_pguids.length > 0){
          selected_pguids.forEach(function (d){
            // TODO Do something about the name's T.J, etc...
            var key_updated = getUpdatedKey(d.toString());
            d3.select("#" + key_updated);
            var position = PGUID_TO_NAME_MAP[d][1];
            var correct_color;
            if ( position == 'qb') {
              correct_color = "cornflowerblue";
            } else if ( position == 'wr') {
              correct_color = "sandybrown";
            } else if ( position == 'te') {
              correct_color = "limegreen";
            } else if ( position == 'rb') {
              correct_color = "firebrick";
            }
            var sel = d3.select('path#' + key_updated)
              .style("stroke", correct_color);
            sel.moveToFront();
          });
        } else {
          var paths = d3.selectAll("path.playerlines");
          // console.log("PATHS ARE: " + paths);
          paths.style('stroke', default_line_color);
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

        var butgp = svg.append("g").attr("class","buttongroup")
                       .attr("transform", "translate("+relx(45)+"," + rely(33) + ")");

        butgp.append("rect")
                  .attr("class","season_button")
                  .attr("id","avgbut")
                  .attr("rx",relx(1))
                  .attr("ry",rely(1))
                  .attr("width", relx(5))
                  .attr("height", rely(96.5))
                  .attr("stroke","black")
                  .attr("fill","white")
                  .on("click",function(){
                        var active = avgjoeline.active ? false : true;
                        var opacity = active ? 0 : 1;
                        var fillcol = active ? "white" : "firebrick"
                        d3.select("#avgjoeline").style("opacity", opacity);
                        d3.select("#avgbut").attr("fill",fillcol)
                        avgjoeline.active = active;
                     });

        butgp.append("text")
             .attr("dx", relx(6))
             .attr("dy", rely(98))
             .style("font-size", "10px")
             .text("Average")

        butgp.append("rect")
                  .attr("class","season_button")
                  .attr("id","goodbut")
                  .attr("y", rely(95.5))
                  .attr("rx",relx(1))
                  .attr("ry",rely(1))
                  .attr("width", relx(5))
                  .attr("height", rely(96.5))
                  .attr("stroke","black")
                  .attr("fill","white")
                     .on("click",function(){
                            var active = goodguyline.active ? false : true;
                            var opacity = active ? 0 : 1;
                            var fillcol = active ? "white" : "seagreen"
                            d3.select("#goodguyline").style("opacity", opacity);
                            d3.select("#goodbut").attr("fill",fillcol)
                            goodguyline.active = active;
                     });

        butgp.append("text")
             .attr("dx", relx(6))
             .attr("dy", rely(93))
             .style("font-size", "10px")
             .text("Good")

        butgp.append("rect")
                  .attr("class","season_button")
                  .attr("id","elitebut")
                  .attr("y", rely(91))
                  .attr("rx",relx(1))
                  .attr("ry",rely(1))
                  .attr("width", relx(5))
                  .attr("height", rely(96.5))
                  .attr("stroke","black")
                  .attr("fill","white")
                     .on("click",function(){
                            var active = eliteguyline.active ? false : true;
                            var opacity = active ? 0 : 1;
                            var fillcol = active ? "white" : "salmon"
                            d3.select("#eliteguyline").style("opacity", opacity);
                            d3.select("#elitebut").attr("fill",fillcol)
                            eliteguyline.active = active;
                     });

        butgp.append("text")
             .attr("dx", relx(6))
             .attr("dy", rely(87.9))
             .style("font-size", "10px")
             .text("Elite")

        var reltext = svg.append("text")
                        .attr("x", relx(1))
                        .attr("y", rely(100))
                         .style("font-size", "10px")
                        .text("Toggle Year")

        var relbutton = svg.append("rect")
                  .attr("class","season_button")
                  .attr("id","relabs")
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
                      if (absyear) {
                        relbutton.attr("fill","black")
                            reltext.text("Toggle Season")
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
                        d3.select("#seasonaltitle").text("Points / Year");


                      } else {
                            relbutton.attr("fill","white")
                            reltext.text("Toggle Year")
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
                            d3.select("#seasonaltitle").text("Points / Season");

                      }
                  });

    svg.append("text")
        .attr("id","seasonaltitle")
        .attr("x", width/2)
        // .attr("y", rely(100))
        .attr("y", 0 - (margin.top / 2) - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Points / Season");

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
            if (d.season_ff_pts !== undefined && d.season_ff_pts !== NaN)
              yearlist[numyears-1].push(d.season_ff_pts)
        }
    }); //end seasonal_data loading
    return [season_seasonal_dataset, yeartuples, avgcnt, avgpoints, yearlist]
}

function updateSeasonalData(seasonal_data){

  d3.select(".x axis").remove();
  d3.select(".y axis").remove();
  d3.selectAll(".playerlines").remove();
  d3.select("#sm-sec-3 svg").remove();

  generateLineChart( seasonal_data );
}

function CheckColor(color_attr){
    blue = d3.rgb("#1f77b4")
    orange = d3.rgb("#ff7f0e")
    green = d3.rgb("#2ca02c")
    ltblue = d3.rgb("#6495ed")
    brown = d3.rgb("#f4a460")
    lime = d3.rgb("#32cd32")
    red = d3.rgb("#d62728")
    fire = d3.rgb("#b22222")
    rgb = color_attr.split("(")[1].split(")")[0].split(",")
    
    if (+rgb[0]==red.r && +rgb[1]==red.g && rgb[2]==red.b) { return "red"}
    if (+rgb[0]==blue.r && +rgb[1]==blue.g && rgb[2]==blue.b) { return "blue" }
    if (+rgb[0]==orange.r && +rgb[1]==orange.g && rgb[2]==orange.b) { return "orange" }
    if (+rgb[0]==green.r && +rgb[1]==green.g && rgb[2]==green.b) { return "green" }
    if (+rgb[0]==ltblue.r && +rgb[1]==ltblue.g && rgb[2]==ltblue.b) { return "cornflowerblue" }
    if (+rgb[0]==brown.r && +rgb[1]==brown.g && rgb[2]==brown.b) { return "sandybrown" }
    if (+rgb[0]==lime.r && +rgb[1]==lime.g && rgb[2]==lime.b) { return "limegreen" }
    if (+rgb[0]==fire.r && +rgb[1]==fire.g && rgb[2]==fire.b) { return "firebrick" }
    return false
}
