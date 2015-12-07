function generateCDF_D3Chart(data){
//     console.log(cdf_data)
    var temp_data = jQuery.extend(true, {}, data);
    var cdf_data = []
    for (var key in temp_data) {
        cdf_data.push(temp_data[key])
    }
//     console.log(cdf_data)
    var cdf_dataset = [];
    var selected_color = "cornflowerblue"
    var parseDate = d3.time.format("%Y").parse;
    var color = d3.scale.category10();


    var margin = { top: 10, right: 30, bottom: 50, left: 45 }
        , width = parseInt(d3.select('.large-chart').style('width'), 10)
        , width = width - margin.left - margin.right
        , height = parseInt(d3.select('.large-chart').style('height'), 10)
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

    var svg = d3.select("#lrg-sec-1").append("svg")
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
//  GET cdf_data AND MANIPULATE IT
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

    cdf_data.forEach(function(d) {
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
                    "real_year": parseDate((startyear+numyears-1).toString()),
                    "season_ff_pts":0}
            cdf_dataset.push(base);
//                 if (avgpoints.length < numyears){
    //                 avgpoints.push(0)
    //                 avgcnt.push(0)
    //             }
    //             avgcnt[numyears-1] += 1
            numyears++
        }
        if (curyear != 2015) {
            cumpoints += d.season_ff_pts
            d.season_ff_pts = cumpoints
            d.real_year = parseDate(d.real_year.toString())
            cdf_dataset.push(d);
            if (avgpoints.length < numyears) {
                avgpoints.push(0)
                avgcnt.push(0)
                yearlist.push([])
            }
            avgpoints[numyears-1] += d.season_ff_pts
            avgcnt[numyears-1] += 1
            yearlist[numyears-1].push(d.season_ff_pts)
        }
    }); //end cdf_data loading

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

    var cdf_dataGroup = d3.nest()
                      .key(function(d) {
                        return d.guid;
                      })
                     .entries(cdf_dataset);

    var keys = d3.keys(cdf_dataGroup);
    color.domain(d3.keys(cdf_dataGroup));


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

    

    x.domain(d3.extent(cdf_dataset, function(d) { return d.year; }));
//     y.domain(d3.extent(cdf_dataset, function(d) { return d.season_ff_pts; }));
    xTime.domain(d3.extent(cdf_dataset, function(d) {return d.real_year;}));
//     x.domain([1,d3.max(cdf_dataset, function(d) { return d.year; })]);
    y.domain([-10,d3.max(cdf_dataset, function(d) { return d.season_ff_pts; })]);
    minmax = d3.extent(cdf_dataset, function(d) {return d.real_year})
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
            .attr("id","cdfnameline")
            .attr("x", 50)
            .attr("y", height+margin.bottom-20)
            .style("font-size", "10px") 

    yearline.append("text")
            .attr("id","cdfyearline")
            .attr("x", 35)
            .attr("y", height+margin.bottom-10)
            .style("font-size", "10px") 

    pointsline.append("text")
            .attr("id","cdfpointsline")
            .attr("x", 15)
              .attr("y", height+margin.bottom)
            .style("font-size", "10px") 

    averageline.append("text")
            .attr("id","cdfaverageline")
            .attr("x", 9)
               .attr("y", height+margin.bottom)
              .style("font-size", "10px") 

    svg.append("text")
        .attr("id","cdftitle")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 3) + 5)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text("Player Points / Season");

//  *****************************************************
//  BUILD THE LINE CHART
// ******************************************************
    cdf_dataGroup.forEach(function(d, i) {
        var cdfline = svg.append("path")
                       .attr("class", "cdf_line")
                       .attr("id", "path_"+d.key)
                       .attr("d", line(d.values))
                       .attr("fill","none")
                       .style('stroke-width', 3)
                       .style("stroke", "whitesmoke")
                       .on("click", function() {
                            color_attr = d3.select(this).style("stroke")
                            console.log(color_attr)
                            rgb = color_attr.split("(")[1].split(")")[0].split(",")
                            cfb= d3.rgb("whitesmoke")
                            if (!(+rgb[0]==cfb.r && +rgb[1]==cfb.g && +rgb[2]==cfb.b)) {
                                d3.select(this)
                                .style('stroke', colorScale(PGUID_TO_NAME_MAP[d.key][1]))
                            } else {
                                d3.select(this).style("stroke","whitesmoke");
                            }
                       })
                       .on("mouseover", function() {
                            var line = d3.select(this);
                            line.style('stroke', colorScale(PGUID_TO_NAME_MAP[d.key][1]))
                            // line.style('stroke', d3.hsl('#33b9ff'));
                            this.parentNode.parentNode.appendChild(this.parentNode);
                            d3.select(this.nextSibling)
                              .attr("opacity", "1")

                            focus.style("display", null);
// //                             iline.style("stroke","steelblue")
                            var sel = d3.select(this);
                            sel.moveToFront();
//                             color_attr = d3.select(this).style("stroke")
//                             cfb= d3.rgb("cornflowerblue")
//                             rgb = color_attr.split("(")[1].split(")")[0].split(",")
//                             if (+rgb[0]==cfb.r && +rgb[1]==cfb.g && +rgb[2]==cfb.b) {
//                                 iline.style("stroke","cornflowerblue");
//                             } else {
//                                 iline.style("stroke","steelblue");
//                             }

                        })
                      .on("mouseout", function() {
                            focus.style("display", "none");
//                             iline.style("stroke","whitesmoke");
                            var sel = d3.select(this);
                            color_attr = d3.select(this).style("stroke")
                            cfb= d3.rgb(selected_color)
                            rgb = color_attr.split("(")[1].split(")")[0].split(",")
                            if (+rgb[0]==cfb.r && +rgb[1]==cfb.g && +rgb[2]==cfb.b) {
                                cdfline.style("stroke", selected_color);
                            } else {
                                cdfline.style("stroke","whitesmoke");
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
                            yearline.select("text").text("Years: " + totyears + "......  Total Points: " + totpts);
//                             pointsline.select("text").text("Total Points: " + totpts);
                            averageline.select("text").text("Average/Season: " + avg + " (Best: "+bestyr+", Worst: " + worstyr+")");
                            d3.select("#cdfnameline").moveToFront()
                            d3.select("#cdfyearline").moveToFront()
                            d3.select("#cdfpointsline").moveToFront()
                            d3.select("#cdfaverageline").moveToFront()
                        });
//                 console.log(d)
//                 iline.append("text")
//                     .datum([d], function(dprime) {
//                         console.log(dprime)
//                       // console.log("TEST STRING PRIOR");
//                       return {name: PGUID_TO_NAME_MAP[dprime.key], value:     dprime.values[dprime.values.length - 1]}; })
//                     .attr("transform", function(d) { return "translate(" + x(dprime.value.x) + "," + y(dprime.value.y) + ")"; })
//                     .attr("x", 3)
//                     .attr("dy", ".35em")
//                     .text(function(d) { return d.name + ' (' + d.value.y + ') ' ; })
//                     .attr("opacity", "0");


    });
    dispatch.on("lasso_cdf", function(lassoed_items) {
      // console.log(lassoed_items);
      if(lassoed_items.length > 0){
        lassoed_items.forEach(function (d){
          // console.log("Pguid is: " + d.pguid);
          d3.select('#path_' + d.pguid)
          .style('stroke-width','3.5px');
        });
      } else {
        // var paths = d3.selectAll("*[id^='path']");
        var paths = d3.selectAll(".cdf_line");
        paths.style('stroke-width', '1.75px');
      }
    });
//  *****************************************************
//  BUILD THE REFERENCE LINES
// ******************************************************
    var avgjoeline = svg.append("path")
                        .attr("class","cdfdistribution_lines")
                        .attr("id","cdfavgjoeline")
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
                         .attr("class","cdfdistribution_lines")
                         .attr("id","cdfgoodguyline")
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
                          .attr("class","cdfdistribution_lines")
                          .attr("id","cdfeliteguyline")
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
    cdfeliteguyline.active = true
    cdfgoodguyline.active = true
    cdfavgjoeline.active = true

//  *****************************************************
//  BUTTONS TO TOGGLE THE REFERENCE LINE
// ******************************************************
    b_height = height+margin.bottom+margin.top;

        svg.append("rect")
                  .attr("class","cdfbutton")
                  .attr("id","cdfcavgbut")
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
                        d3.select("#cdfavgjoeline").style("opacity", opacity);
                        avgjoeline.active = active;
                     });

        svg.append("rect")
                  .attr("class","cdfbutton")
                  .attr("id","cdfgoodbut")
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
                            d3.select("#cdfgoodguyline").style("opacity", opacity);
                            goodguyline.active = active;
                     });

        svg.append("rect")
                  .attr("class","cdfbutton")
                  .attr("id","cdfelitebut")
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
                            d3.select("#cdfeliteguyline").style("opacity", opacity);
                            eliteguyline.active = active;
                     });

        var relbutton = svg.append("rect")
                  .attr("class","cdfbutton")
                  .attr("id","cdfrelabs")
                  .attr("x", width - margin.right - 30)
                  .attr("y", 10)
                  .attr("rx",width/50)
                  .attr("ry",height/50)
                  .attr("width", width/20)
                  .attr("height", height/25)
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
                        cdf_dataGroup.forEach(function(d, i) {
                            sel.select("#path_"+d.key)
                               .duration(1500)
                               .attr("d",line(d.values))
                        });
                        d3.select("#cdfavgjoeline").attr("d",line(avgjoe2.values))
                        d3.select("#cdfgoodguyline").attr("d",line(goodguy2.values))
                        d3.select("#cdfeliteguyline").attr("d",line(eliteguy2.values))
                        d3.select("#cdftitle").text("Average Points / Class");
                        

                      } else {
                            relbutton.text("Years")
//                             xAxis.tickFormat(formatxAxis)
                            xAxis.scale(x)
                                .ticks(range)
                            svg.selectAll("g .x.axis")
                                .transition().duration(1000)
                               .call(xAxis);
                            var sel = d3.select("body").transition();
                                cdf_dataGroup.forEach(function(d, i) {
                                    sel.select("#path_"+d.key)
                                       .duration(1500)
                                       .attr("d",line(d.values))
                            });
                            d3.select("#cdfavgjoeline").attr("d",line(avgjoe.values))
                            d3.select("#cdfgoodguyline").attr("d",line(goodguy.values))
                            d3.select("#cdfeliteguyline").attr("d",line(eliteguy.values))
                            d3.select("#cdftitle").text("Average Points / Season");

                      }
                  });
  //not sure what this is about
} // Close function generateLineChart


function updateCDFData(cdf_data){

  d3.select(".x axis").remove();
  d3.select(".y axis").remove();
  d3.selectAll(".cdf_line").remove();
  d3.select("#lrg-sec-1 svg").remove();

  generateCDF_D3Chart(cdf_data);
}
//   var absyear = false;
//   var parseDate = d3.time.format("%Y").parse;
// 
//   var xTime = d3.time.scale()
//                   .range([0, cdf_width]);
// 
//   var x = d3.scale.linear().range([0, cdf_width]);
//   var y = d3.scale.linear().range([cdf_height, 0]);
// 
//   var color = d3.scale.category10();
// 
//   var xAxis = d3.svg.axis()
//       .scale(x)
//       .orient("bottom");
// 
//   var yAxis = d3.svg.axis()
//       .scale(y)
//       .orient("left");
// 
//   var line = d3.svg.line()
//       .interpolate("basis")
//       .x(function(d) {
//         if (absyear == false){
//           return x(d.x);
//         } 
//           return xTime(d.year)
//       })
//       .y(function(d) {
//             return y(d.y);
//       });
// 
//       // .x(function(d) { return x(d.x); })
//       // .y(function(d) { return y(d.y); });
// 
//   var cdf_svg = d3.select("#lrg-sec-1").append("svg")
//       .attr("width", cdf_width + cdf_margin.left + cdf_margin.right)
//       .attr("height", cdf_height + cdf_margin.top + cdf_margin.bottom)
//       .append("g")
//       .attr("transform", "translate(" + cdf_margin.left + "," + cdf_margin.top + ")");
// 
//   // var selected_players = filteredPlayers();
//   // // console.log(selected_players);
//   // var filter_string = '?players=';
//   // selected_players.forEach(function (d){
//   //   filter_string += (','+d.pguid);
//   // });
//   // console.log(filter_string);
// 
//   var cdf_data_conv;
// 
//   // d3.json('http://localhost:8000/seasons_subset/'+filter_string, function(error,cdf_data){
//   //   if (error) throw error;
// 
//     cdf_data_conv = convertcdf_data(cdf_data);
// 
//     var keys = d3.keys(cdf_data_conv);
//     color.domain(d3.keys(cdf_data_conv));
// 
//     x.domain([
//       0,
//       d3.max(cdf_data_conv, function(d) { return d.values.length; })  // Want the longest length career
//     ]);
// 
//     xTime.domain(d3.extent(cdf_data_conv, function(d) {return d.year;}));
// 
//     y.domain([
//       d3.min(cdf_data_conv, function(d) { return d3.min(d.values, function(v) { return v.y; }); }),
//       d3.max(cdf_data_conv, function(d) { return d3.max(d.values, function(v) { return v.y; }); })
//     ]);
// 
//     cdf_svg.append("g")
//         .attr("class", "x axis")
//         .attr("transform", "translate(0," + cdf_height + ")")
//         .call(xAxis)
//         .append("text")
//           .attr("text-anchor", "middle")
//           .attr("transform", "translate("+ (cdf_width/2) +","+cdf_height+")")
//           .text("Years Played");
// 
//     cdf_svg.append("g")
//         .attr("class", "y axis")
//         .call(yAxis)
//       .append("text")
//         .attr("transform", "rotate(-90)")
//         .attr("y", 6)
//         .attr("dy", ".71em")
//         .style("text-anchor", "end")
//         .text("Cumulative Fantasy Points");
// 
//     var player = cdf_svg.selectAll(".player")
//         .cdf_data(cdf_data_conv)
//       .enter().append("g")
//         .attr("class", "player");
// 
//     player.append("path")
//         // .attr("class", "line")
//         .attr("class", "cdf_line")
//         .attr("d", function(d) { return line(d.values); })
//         .attr("id" , function(d){
//               var key_updated = d.key.toString().replace(/\./g, '');
//               // console.log(key_updated);
//               return 'path_' + key_updated;
//         })
//         .attr("stroke-linecap","round")
//         .style("stroke", function(d) { return d3.hsl('#dddddd') })
//         .on('mouseover', function(d) {
//             var line = d3.select(this);
//             line.style('stroke', colorScale(PGUID_TO_NAME_MAP[d.key][1]))
//             // line.style('stroke', d3.hsl('#33b9ff'));
//             this.parentNode.parentNode.appendChild(this.parentNode);
//             d3.select(this.nextSibling)
//               .attr("opacity", "1")
//         })
//         .on('mouseout', function(d) {
//             // console.log(d);
//             var line = d3.select(this);
//             line.style('stroke', d3.hsl('#dddddd'));
//             // line.moveToBack();
//             d3.select(this.nextSibling)
//               .attr("opacity", "0")
//         });
// 
//         // Set them to not show at first
//         d3.selectAll(".cdf_line").style("opacity","0");
//         animateLines();
// 
//     dispatch.on("lasso_cdf", function(lassoed_items) {
//       // console.log(lassoed_items);
//       if(lassoed_items.length > 0){
//         lassoed_items.forEach(function (d){
//           // console.log("Pguid is: " + d.pguid);
//           d3.select('#path_' + d.pguid)
//           .style('stroke-width','3.5px');
//         });
//       } else {
//         // var paths = d3.selectAll("*[id^='path']");
//         var paths = d3.selectAll(".cdf_line");
//         paths.style('stroke-width', '1.75px');
//       }
//     });
// 
//     player.append("text")
//         .datum(function(d_sub) {
//           // console.log("TEST STRING PRIOR");
//           return {name: PGUID_TO_NAME_MAP[d_sub.key][0], value: d_sub.values[d_sub.values.length - 1]}; })
//         .attr("transform", function(d_sub) { return "translate(" + x(d_sub.value.x) + "," + y(d_sub.value.y) + ")"; })
//         .attr("x", 3)
//         .attr("dy", ".35em")
//         .text(function(d_sub) { return d_sub.name + ' (' + d_sub.value.y + ') ' ; })
//         .attr("opacity", "0");
// 
//         var cdfyrtog = cdf_svg.append("rect")
//                           .attr("class","button")
//                           .attr("id","elitebut")
//                           .attr("x", cdf_width-cdf_margin.right-30)
//                           .attr("y", 10)
//                           .attr("rx",cdf_width/30)
//                           .attr("ry",cdf_height/30)
//                           .attr("width", cdf_width/10)
//                           .attr("height", cdf_height/15)
//                           .attr("stroke","black")
//                           .attr("fill","yellow")
//                           .on("click",function(){
//                             absyear = !absyear;
//                             // absyear = absyear ? false : true;
//                             if (absyear) {
//                               cdfyrtog.text("Relative")
//                             xTime.domain(d3.extent(cdf_data_conv, function(d) {return d.year;}));
//                               xAxis.scale(xTime);
//                               cdf_svg.select("g .x.axis")
//                                  .call(xAxis);
//                               var sel = d3.select("body").transition();
//                               console.log(cdf_data_conv)
//                               cdf_data_conv.forEach(function(d){
//                                 var key_updated = d.key.toString().replace(/\./g, '');
//                                 // console.log(d.values);
//                                 // var temp = sel.select("#path_"+key_updated);
//                                 // console.log(temp);
//                                 console.log(sel.select("#path_"+key_updated))
//                                 console.log(d.values)
//                                 sel.select("#path_"+key_updated)
// //                                    .duration(1500)
//                                    .attr("d", line(d.values));
//                               });
//                             } else {
//                               cdfyrtog.text("Years")
//                               xAxis.scale(x);
//                               cdf_svg.select("g .x.axis")
//                                  .call(xAxis);
//                               var sel = d3.select("body").transition();
//                               cdf_data_conv.forEach(function(d){
//                                 var key_updated = d.key.toString().replace(/\./g, '');
//                                 // sel.select("#path_"+key_updated)
//                                 //    .duration(1500)
//                                 //    .attr("d", line(d.values));
//                               });
//                             }
//                         });
//     // });
// }
// 
// function animateLines()
// {
//     d3.selectAll( ".cdf_line" ).style( "opacity", "0.5" );
// 
//     //Select All of the lines and process them one by one
//     d3.selectAll( ".cdf_line" ).each( function ( d, i )
//     {
//         var key_updated = d.key.toString().replace( /\./g, '' );
//         // Get the length of each line in turn
//         var totalLength = d3.select( "#path_" + key_updated ).node().getTotalLength();
// 
//         d3.selectAll( "#path_" + key_updated ).attr( "stroke-dasharray", totalLength + " " + totalLength )
//             .attr( "stroke-dashoffset", totalLength )
//             .transition()
//             .duration( 2000 )
//             .delay( 10 * i )
//             .ease( "quad" ) //Try linear, quad, bounce... see other examples here - http://bl.ocks.org/hunzy/9929724
//             .attr( "stroke-dashoffset", 0 )
//             .style( "stroke-width", 3 )
//     } );
// 
// }
// 
// function updateCDFcdf_data(cdf_data){
// 
//   d3.select(".x axis").remove();
//   d3.select(".y axis").remove();
//   d3.selectAll(".cdf_line").remove();
//   d3.select("#lrg-sec-1 svg").remove();
//   
//   generateCDF_D3Chart(cdf_data);
// }
// 
// // Returns an array of objects of the form:
// //  [{
// //      key: pguid
// //      values: arr [ x <-- year,
// //                    y <-- ff_pts (cumulative)]
// //
// //  },...]
// function convertcdf_data(cdf_data){
//   var parseDate = d3.time.format("%Y").parse;
// 
//   var lines = {};
//   var plot_cdf_data = [];
// 
//   if(cdf_data !== undefined && cdf_data.length > 0){
//     var nameDict = {};
//     for(var item in cdf_data){
//       var pguid = cdf_data[item].season_guid.split("_")[0];
//       var player_name;
//       // console.log(player_name);
//       var season_year = cdf_data[item].season_guid.split("_")[1];
//       var ff_pts = cdf_data[item].season_ff_pts;
//       if(!(pguid in lines)){
//         // Store the start year for the first entry
//         lines[pguid] = {'values': [{x: 0, y: 0, year: parseDate(season_year)}]};
//         // lines[pguid] = {'values': [{x: 1, y: ff_pts, year: season_year}]};
//         var temp = +season_year + 1
//         lines[pguid]['values'].push({x: 1, y: ff_pts, year: parseDate(temp.toString())});
// 
//       } else {
//         var last = lines[pguid]['values'].length;
//         console.log(last)
//         console.log(lines[pguid]['values'])
//         var last_year = lines[pguid]['values'][last-2].year;
//         last_year = last_year.getFullYear();
//         last_year++;
//         last_year = +last_year;
//         lines[pguid]['values'].push({x: last++, y: ff_pts, year: parseDate(last_year.toString())});
//       }
//     }
// 
//     for(var key_obj in lines){
// 
//       // Update these to be cumsum
//       var vals = lines[key_obj]['values'];
// 
//       if(vals.length > 1){
//         for(var i = 1; i < vals.length; i++){
//           vals[i].y += vals[i-1].y;
//         }
//       }
// 
//       plot_cdf_data.push({key: key_obj, values: vals});
// 
//     }
//   }
//   // Otherwise the cdf_data's empty
//   // console.log(plot_cdf_data);
//   return plot_cdf_data;
// }
