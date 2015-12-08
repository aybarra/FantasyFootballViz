function generateCDF_D3Chart(data){
// //     console.log(cdf_data)
//     var temp_data = jQuery.extend(true, {}, data);
//     var cdf_data = []
//     for (var key in temp_data) {
//         cdf_data.push(temp_data[key])
//     }
// //     console.log(cdf_data)
//     var cdf_dataset = [];
//     var selected_color = "cornflowerblue"
//     var parseDate = d3.time.format("%Y").parse;
//     var color = d3.scale.category10();


//     var margin = { top: 45, right: 30, bottom: 50, left: 45 }
//         , width = parseInt(d3.select('.large-chart').style('width'), 10)
//         , width = width - margin.left - margin.right
//         , height = parseInt(d3.select('.large-chart').style('height'), 10)
//         , height = height - margin.top - margin.bottom;

//     var absyear = false;

//     var xTime = d3.time.scale()
//                   .range([0, width]);

//     var x = d3.scale.linear()
//               .range([0, width]);

//     var y = d3.scale.linear()
//               .range([height, 0]);
//     var relx = d3.scale.linear()
//                .range([0, width+margin.left+margin.right])
//                .domain([0,100])

//     var rely = d3.scale.linear()
//               .range([height+margin.top+margin.bottom, 0])
//               .domain([0,100])

//     var line = d3.svg.line()
//                  .x(function(d) {
//                     if (absyear == false){
//                         return x(d.year);
//                     }
//                     return xTime(d.real_year)
//                   })
//                 .y(function(d) {
//                     return y(d.season_ff_pts);
//                 });

//     var svg = d3.select("#lrg-sec-1").append("svg")
//                 .attr("width", width + margin.left + margin.right)
//                 .attr("height", height + margin.top + margin.bottom)
//                 .append("g")
//                 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     svg.append("text")
//         .attr("id","cdftitle")
//         .attr("x", (width / 2))
//         // .attr("y", rely(99))
//         .attr("y", 0 - (margin.top / 2) - 10)
//         .attr("text-anchor", "middle")
//         .style("font-size", "16px")
//         .style("text-decoration", "underline")
//         .text("Player Points / Season");


// //  *****************************************************
// //  MOVE SVG ITEM TO FRONT AND BACK
// // ******************************************************
//     d3.selection.prototype.moveToFront = function() {
//         return this.each(function(){
//             this.parentNode.appendChild(this);
//         });
//     }

//     d3.selection.prototype.moveToBack = function() {
//         return this.each(function() {
//             var firstChild = this.parentNode.firstChild;
//                 if (firstChild) {
//                     this.parentNode.insertBefore(this, firstChild);
//                 }
//         });
//     };

// //  *****************************************************
// //  GET cdf_data AND MANIPULATE IT
// // ******************************************************

//     var curid = []
//     var startyear
//     var cumpoints
//     var numyears
//     var avgcnt = []
//     var avgpoints = []
//     var avgjoe = {}
//     var yearlist = []
//     var season_dev = []
//     var cdfyeartuples = []

//     cdf_data.forEach(function(d) {
//         d.guid = d.season_guid.split("_")[0]
//             if (d.guid.indexOf('.') != -1) {
//                 d.guid = d.guid.replace('.','');
//             }
//         if (d.guid == "StPBr20"){ console.log(d)}
//         d.year = +d.season_guid.split("_")[1]
//         curyear = d.year
//         d.real_year = d.year
// //             d.year = d.season_guid.split("_")[1]
// //             d.year = parseDate(d.year)
// //             console.log(d)
//         d.season_ff_pts = +d.season_ff_pts;
//         if (d.year != 2015) {
//             cdfyeartuples.push([d.year, d.season_ff_pts]);
//         }
//         if (curid != d.guid){
//             curid = d.guid
//             startyear = +d.year
//             numyears = 0
//             cumpoints = 0
//         }
//         d.year -= (startyear - 1)
//         numyears++

//         while (numyears != d.year){
//             base = {"guid":d.guid, "year":numyears,
//                     "real_year": parseDate((startyear+numyears-1).toString()),
//                     "season_ff_pts":cumpoints}
//             cdf_dataset.push(base);
// //                 if (avgpoints.length < numyears){
//     //                 avgpoints.push(0)
//     //                 avgcnt.push(0)
//     //             }
//     //             avgcnt[numyears-1] += 1
//             numyears++
//         }
//         if (curyear != 2015) {
//             cumpoints += d.season_ff_pts
//             d.season_ff_pts = cumpoints
//             d.real_year = parseDate(d.real_year.toString())
//             cdf_dataset.push(d);
//             if (avgpoints.length < numyears) {
//                 avgpoints.push(0)
//                 avgcnt.push(0)
//                 yearlist.push([])
//             }
//             avgpoints[numyears-1] += d.season_ff_pts
//             avgcnt[numyears-1] += 1
//             if(  yearlist == null || yearlist === undefined || (numyears - 1 >= yearlist.length ) )
//             {
//                 console.log( d.guid );
//             }
// //             console.log(d)
//             yearlist[numyears-1].push(d.season_ff_pts)
//         }
//     }); //end cdf_data loading

//     cdfyeartuples.sort(function(a, b) {
//         a = a[0];
//         b = b[0];
//         return a < b ? -1 : (a > b ? 1 : 0);
//     });
//     var curyear = 0
//     var yeartotals = []
//     var yearcnts = []
//     for (var i = 0; i < cdfyeartuples.length; i++) {
//         if (curyear != cdfyeartuples[i][0]) {
//             curyear = cdfyeartuples[i][0]
//             yeartotals.push([curyear,0])
//             yearcnts.push(0)
//         }
//         index = yeartotals.length - 1
//         runningsum = yeartotals[index][1] + cdfyeartuples[i][1]
//         yeartotals[index] = [curyear, runningsum]
//         yearcnts[index] += 1
//     }
//     for (var i = 0; i < yearlist.length; i++) {
//         var stddev = math.std(yearlist[i])
//         season_dev.push(stddev)
//     }

//     var season_dev2 = []
//     var templist = []
// //     console.log(cdfyeartuples)
//     var curyear = 0
//     for (var i = 0; i < cdfyeartuples.length; i++) {
//         if (curyear != cdfyeartuples[i][0]){
//              if (templist.length < 1) {templist.push(0);}
//             var stddev = math.std(templist)
//             season_dev2.push(stddev)
//             templist = []
//             curyear = cdfyeartuples[i][0]
//         } else {
//             templist.push(cdfyeartuples[i][1])
//         }
//     }
//     if (templist.length < 1) {templist.push(0);}
//     var stddev = math.std(templist)
//     season_dev2.push(stddev)

//     avgjoe.key = "AvgJoe"
//     avgjoe.values = []
//     for (var i = 0; i < avgcnt.length; i++) {
//         if (avgcnt[i] > 1){
//             season_pts = Math.round(avgpoints[i]/avgcnt[i])
//             avgjoe.values.push({"season_ff_pts":season_pts, "year":i+1})
//         }
//     }

//     var avgjoe2 = {}
//     avgjoe2.key = "AvgJoe2"
//     avgjoe2.values = []
//     for (var i = 0; i < yearcnts.length; i++) {
//         if (yearcnts[i] > 1){
//             season_pts = Math.round(yeartotals[i][1]/yearcnts[i])
//             year = parseDate(yeartotals[i][0].toString())
//             avgjoe2.values.push({"season_ff_pts":season_pts, "real_year":year})
//         }
//     }

//     var goodguy = {}
//     var eliteguy = {}
//     goodguy.key="GoodGuy"
//     eliteguy.key="Elite"
//     goodguy.values = []
//     eliteguy.values = []
//     for (var i = 0; i < avgcnt.length; i++) {
//         if (avgcnt[i] > 1){
//             season_pts = Math.round(avgjoe.values[i].season_ff_pts + season_dev[i])
//             goodguy.values.push({"season_ff_pts":season_pts, "year":i+1})
//             season_pts = Math.round(avgjoe.values[i].season_ff_pts + (2*season_dev[i]))
//             eliteguy.values.push({"season_ff_pts":season_pts, "year":i+1})
//         }
//     }

//     var goodguy2 = {}
//     var eliteguy2 = {}
//     goodguy2.key="GoodGuy2"
//     eliteguy2.key="Elite2"
//     goodguy2.values = []
//     eliteguy2.values = []
//     for (var i = 0; i < yearcnts.length; i++) {
//         if (yearcnts[i] > 1){
//             season_pts = Math.round(yeartotals[i][1]/yearcnts[i] + season_dev2[i])
//             year = parseDate(yeartotals[i][0].toString())
//             goodguy2.values.push({"season_ff_pts":season_pts, "real_year":year})
//             season_pts = Math.round(yeartotals[i][1]/yearcnts[i] + 2*season_dev2[i])
//             eliteguy2.values.push({"season_ff_pts":season_pts, "real_year":year})
//         }
//     }

//     var cdf_dataGroup = d3.nest()
//                       .key(function(d) {
//                         return d.guid;
//                       })
//                      .entries(cdf_dataset);

//     var keys = d3.keys(cdf_dataGroup);
//     color.domain(d3.keys(cdf_dataGroup));


// //  *****************************************************
// //  BUILD AXIS
// // ******************************************************
// //     var formatxAxis = d3.format('.0f');

//     var xAxis = d3.svg.axis()
//                   .scale(x)
// //                   .tickFormat(formatxAxis)
//                   .orient("bottom");

//     var yAxis = d3.svg.axis()
//                   .scale(y)
//                   .tickFormat(d3.format("d"))
//                   .orient("left");



//     x.domain(d3.extent(cdf_dataset, function(d) { return d.year; }));
// //     y.domain(d3.extent(cdf_dataset, function(d) { return d.season_ff_pts; }));
//     xTime.domain(d3.extent(cdf_dataset, function(d) {return d.real_year;}));
// //     x.domain([1,d3.max(cdf_dataset, function(d) { return d.year; })]);
//     y.domain([-10,d3.max(cdf_dataset, function(d) { return d.season_ff_pts; })]);
//     minmax = d3.extent(cdf_dataset, function(d) {return d.real_year})
//     range = minmax[1].getFullYear() - minmax[0].getFullYear()
//     xAxis.ticks(range)

//     svg.append("g")
//        .attr("class", "x axis")
//        .attr("transform", "translate(0," + height + ")")
//        .call(xAxis);

//     svg.append("g")
//        .attr("class", "y axis")
//        .call(yAxis)
//        .append("text")
//        .attr("transform", "rotate(-90)")
//       .attr("y", 0 - margin.left)
//       .attr("x",0 - (height / 2))
//       .attr("dy", "1em")
//       .style("text-anchor", "middle")
//       //  .attr("transform", "rotate(-90)")
//       //  .attr("y", -42)
//       //  .attr("x", -150)
//       //  .attr("dy", ".71em")
//       //  .style("text-anchor", "end")
//        .text("Seasonal Fantasy Points");

// //  *****************************************************
// //  CIRCLES FOR DEATILS ON DEMANSD MOUSE HOVER
// // ******************************************************
//     var focus = svg.append("g")
//                    .attr("class", "cdffocus")
//                    .style("display", "none");

//     focus.append("circle")
//          .attr("r", 3)
//          .attr("stroke","black")
//     focus.append("text")
//          .attr("id","cdffocusname")
//          .attr("x", -5)
//          .attr("dy", "-2.5em")
//          .style("font-size", "10px")

//     focus.append("text")
//          .attr("id","cdffocusyear")
//          .attr("x", -5)
//          .attr("dy", "-1.5em")
//          .style("font-size", "10px")

//     focus.append("text")
//          .attr("id","cdffocuspoints")
//          .attr("x", -5)
//          .attr("dy", "-.5em")
//          .style("font-size", "10px")


// //  *****************************************************
// //  PLACEHOLDERS FOR PLAYER SUMMARY STATISTICS
// // ******************************************************

//     var statgroup = svg.append("g")
//                        .attr("class", "stats")
//                        .attr("transform", "translate(" + relx(1) + "," + rely(88)+ ")")

//     statgroup.append("text")
//             .attr("id","cdfnameline")
//             .style("font-size", "10px")

//     statgroup.append("text")
//             .attr("id","cdfyearline")
//             .attr("dy", 10)
//             .style("font-size", "10px")

//     statgroup.append("text")
//             .attr("id","cdfpointsline")
//             .attr("dy", 20)
//             .style("font-size", "10px")

//     statgroup.append("text")
//             .attr("id","cdfavgline")
//             .attr("dy", 30)
//             .style("font-size", "10px")

// //  *****************************************************
// //  BUILD THE LINE CHART
// // ******************************************************
//     cdf_dataGroup.forEach(function(d, i) {
//         var cdfline = svg.append("path")
//                        .attr("class", "cdf_line")
//                        .attr("id", "path_"+d.key)
//                        .attr("d", line(d.values))
//                        .attr("fill","none")
//                        .style("stroke", "whitesmoke")
//                        .on("click", function() {
//                             var splice_index = selected_pguids.indexOf(d.key);
//                             if(splice_index == -1){
//                               // Add it because you clicked it
//                               console.log("Added from cdf");
//                               selected_pguids.push(d.key);
//                             } else {
//                               // Remove it because you double clicked it
//                               selected_pguids.splice(splice_index, 1);
//                             }

//                             // Notifies everyone else to highlight/unhighlight
//                             dispatch.project_click();

//                             color_attr = d3.select(this).style("stroke")
//                             rgb = color_attr.split("(")[1].split(")")[0].split(",")
//                             colorcheck = CDFcheckColor(color_attr)
//                             var sel = d3.select(this);
//                             if (colorcheck == 'red') {
//                                     sel.style("stroke", "firebrick")
//                             }
//                             if (colorcheck == 'blue') {
//                                     sel.style("stroke", "cornflowerblue")
//                             }
//                             if (colorcheck == 'orange') {
//                                     sel.style("stroke", "sandybrown")
//                             }
//                             if (colorcheck == 'green') {
//                                     sel.style("stroke", "limegreen")
//                             }
//                             if (colorcheck == 'cornflowerblue' ||
//                                 colorcheck == 'sandybrown' ||
//                                 colorcheck == 'limegreen' ||
//                                 colorcheck == 'firebrick') {
//                                     sel.style("stroke", "whitesmoke")
//                                     sel.style("stroke-width", "2px")
//                             }
//                        })
//                        .on("mouseover", function() {
//                             focus.style("display", null);
//                             color_attr = d3.select(this).style("stroke")
//                             color = colorScale( getPlayerInformationFromPguidMap(d.key)[1] )
// //                             console.log(color)
//                             var sel = d3.select(this);
//                             sel.moveToFront();
//                             sel.transition().duration(100)
//                                 .ease("bounce")
//                                 .style("stroke-width", "9px")
//                             colorcheck = CDFcheckColor(color_attr)
//                             if (!(colorcheck == 'cornflowerblue' || 
//                                 colorcheck == 'sandybrown' ||
//                                 colorcheck == 'limegreen' ||
//                                 colorcheck == 'firebrick' )) {
//                                     sel.style('stroke', color)                                
//                             }
//                         })
//                       .on("mouseout", function() {
//                             focus.style("display", "none");
// //                             iline.style("stroke","whitesmoke");
//                             var sel = d3.select(this);
//                             sel.transition().duration(100)
//                                 .ease("bounce").style("stroke-width", "2px")
//                             color_attr = d3.select(this).style("stroke")
//                             cfb= d3.rgb(selected_color)
//                             rgb = color_attr.split("(")[1].split(")")[0].split(",")
//                             colorcheck = CDFcheckColor(color_attr)
//                             if (!(colorcheck == 'cornflowerblue' || 
//                                 colorcheck == 'sandybrown' ||
//                                 colorcheck == 'limegreen' ||
//                                 colorcheck == 'firebrick')) {
//                                     sel.style('stroke', "whitesmoke")
//                                     sel.moveToBack()
//                             }
//                         })
//                       .on("mousemove", function(){
//                             if (absyear == true) {
//                                 var rawX = xTime.invert(d3.mouse(this)[0])
//                                 var year = rawX.getFullYear()
//                                 relyear = year - d.values[0].real_year.getFullYear()
//                                 var pts = d.values[relyear].season_ff_pts
//                                 var yr_date = parseDate(year.toString())
//                             } else {
//                                 var rawX = x.invert(d3.mouse(this)[0])
//                                 var year = Math.round(rawX)
//                                 var pts = d.values[year-1].season_ff_pts
//                             }
//                             var totpts = d.values[d.values.length - 1].season_ff_pts
//                             var totyears = d.values.length
//                             var avg = Math.round(totpts/totyears)
//                             if (absyear == true) {
//                                 focus.attr("transform", "translate(" + xTime(yr_date) + "," + y(pts) + ")")
//                             } else {
//                                 focus.attr("transform", "translate(" + x(year) + "," + y(pts) + ")")
//                             }
//                             fullname = getPlayerInformationFromPguidMap(d.key)[0];
//                             focus.select("#cdffocusname").text(fullname);
//                             focus.select("#cdffocusyear").text("Yr: "+year);
//                             focus.select("#cdffocuspoints").text("Pts:"+pts);
//                             focus.moveToFront();
//                             statgroup.select("#cdfnameline").text("Name: " + fullname);
//                             statgroup.select("#cdfyearline").text("Years: " + totyears);
//                             statgroup.select("#cdfpointsline").text("Total Points: " + totpts);
//                             statgroup.select("#cdfavgline").text("Average/Season: " + avg)
//                             d3.select("#cdfnameline").moveToFront()
//                             d3.select("#cdfyearline").moveToFront()
//                             d3.select("#cdfpointsline").moveToFront()
//                         });

//     });

//     dispatch.on("lasso.cdf", function() {
//       if(selected_pguids.length > 0){
//         selected_pguids.forEach(function (d){
//           // console.log("Pguid is: " + d.pguid);
//           d3.select('#path_' + d)
//           .style('stroke-width','3.5px');
//         });
//       } else {
//         // var paths = d3.selectAll("*[id^='path']");
//         var paths = d3.selectAll(".cdf_line");
//         paths.style('stroke', "whitesmoke");

//       }
//     });

//     dispatch.on("project_click.cdf", function(){
//       if(selected_pguids.length > 0){
//         selected_pguids.forEach(function (d){
//           // TODO Do something about the name's T.J, etc...
//           d3.select('#path_' + d)
//             .style("stroke", colorScale(PGUID_TO_NAME_MAP[d][1]))
//         });
//       } else {
//         var paths = d3.selectAll(".cdf_line");
//         paths.style('stroke', "whitesmoke");
//       }
//     });

// //  *****************************************************
// //  BUILD THE REFERENCE LINES
// // ******************************************************
//     var avgjoeline = svg.append("path")
//                         .attr("class","cdfdistribution_lines")
//                         .attr("id","cdfavgjoeline")
//                         .attr("d",line(avgjoe.values))
//                         .attr("fill","none")
//                         .style("opacity",0)
//                         .style("stroke-width",2)
//                         .style("stroke","firebrick")
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
//                          .attr("class","cdfdistribution_lines")
//                          .attr("id","cdfgoodguyline")
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

//     var eliteguyline = svg.append("path")
//                           .attr("class","cdfdistribution_lines")
//                           .attr("id","cdfeliteguyline")
//                           .attr("d",line(eliteguy.values))
//                           .attr("fill","none")
//                           .style("stroke-width",2)
//                           .style("stroke","salmon")
//                           .style("opacity",0)
//                           .on("mouseover", function() {
//                                 focus.style("display", null);
//                                 eliteguyline.style("stroke","darksalmon")
//                                 var sel = d3.select(this)
//                                 sel.moveToFront();
//                           })
//                           .on("mouseout", function() {
//                                 focus.style("display", "none");
//                                 eliteguyline.style("stroke","salmon");
//                           });
//     eliteguyline.active = true
//     goodguyline.active = true
//     avgjoeline.active = true

// //  *****************************************************
// //  BUTTONS TO TOGGLE THE REFERENCE LINE
// // ******************************************************
//     b_height = height+margin.bottom+margin.top;

//         var butgp = svg.append("g").attr("class","cdfbuttongroup")
//                        .attr("transform", "translate("+relx(1)+"," + rely(10) + ")");

//         butgp.append("rect")
//                   .attr("class","cdf_button")
//                   .attr("id","cdfavgbut")
//                   .attr("rx",relx(1))
//                   .attr("ry",rely(1))
//                   .attr("width", relx(5))
//                   .attr("height", rely(96.5))
//                   .attr("stroke","black")
//                   .attr("fill","white")
//                   .on("click",function(){
//                         var active = avgjoeline.active ? false : true;
//                         var opacity = active ? 0 : 1;
//                         var fillcol = active ? "white" : "firebrick"
//                         d3.select("#cdfavgjoeline").style("opacity", opacity);
//                         d3.select("#cdfavgbut").attr("fill",fillcol)
//                         avgjoeline.active = active;
//                      });

//         butgp.append("text")
//              .attr("dx", relx(5.5))
//              .attr("dy", rely(97))
//              .style("font-size", "10px")
//              .text("Average")

//         butgp.append("rect")
//                   .attr("class","cdf_button")
//                   .attr("id","cdfgoodbut")
//                   .attr("x", relx(15))
//                   .attr("rx",relx(1))
//                   .attr("ry",rely(1))
//                   .attr("width", relx(5))
//                   .attr("height", rely(96.5))
//                   .attr("stroke","black")
//                   .attr("fill","white")
//                      .on("click",function(){
//                             var active = goodguyline.active ? false : true;
//                             var opacity = active ? 0 : 1;
//                             var fillcol = active ? "white" : "seagreen"
//                             d3.select("#cdfgoodguyline").style("opacity", opacity);
//                             d3.select("#cdfgoodbut").attr("fill",fillcol)
//                             goodguyline.active = active;
//                      });

//         butgp.append("text")
//              .attr("dx", relx(20.4))
//              .attr("dy", rely(97))
//              .style("font-size", "10px")
//              .text("Good")

//         butgp.append("rect")
//                   .attr("class","cdf_button")
//                   .attr("id","cdfelitebut")
//                   .attr("x", relx(30))
//                   .attr("rx",relx(1))
//                   .attr("ry",rely(1))
//                   .attr("width", relx(5))
//                   .attr("height", rely(96.5))
//                   .attr("stroke","black")
//                   .attr("fill","white")
//                      .on("click",function(){
//                             var active = eliteguyline.active ? false : true;
//                             var opacity = active ? 0 : 1;
//                             var fillcol = active ? "white" : "salmon"
//                             d3.select("#cdfeliteguyline").style("opacity", opacity);
//                             d3.select("#cdfelitebut").attr("fill",fillcol)
//                             eliteguyline.active = active;
//                      });

//         butgp.append("text")
//              .attr("dx", relx(35.4))
//              .attr("dy", rely(97))
//              .style("font-size", "10px")
//              .text("Elite")

//         var reltext = svg.append("text")
//                         .attr("x", relx(1))
//                         .attr("y", rely(100))
//                          .style("font-size", "10px")
//                         .text("Toggle Year")

//         var relbutton = svg.append("rect")
//                   .attr("class","season_button")
//                   .attr("id","relabs")
//                   .attr("x", relx(1))
//                   .attr("y", rely(98))
//                   .attr("rx",relx(1))
//                   .attr("ry",rely(1))
//                   .attr("width", relx(5))
//                   .attr("height", rely(96.5))
//                   .attr("stroke","black")
//                   .attr("fill","white")
//                   .on("click",function(){
//                       absyear = absyear ? false : true;
//                       if (absyear) {
//                         relbutton.attr("fill","black")
//                             reltext.text("Toggle Season")
//                             xAxis.scale(xTime)
//                             .ticks(d3.time.year)

//                         svg.selectAll("g .x.axis")
//                             .transition().duration(1000)
//                            .call(xAxis);
//                         var sel = d3.select("body").transition();
//                         cdf_dataGroup.forEach(function(d, i) {
//                             sel.select("#path_"+d.key)
//                                .duration(1500)
//                                .attr("d",line(d.values))
//                         });
//                         d3.select("#cdfavgjoeline").attr("d",line(avgjoe2.values))
//                         d3.select("#cdfgoodguyline").attr("d",line(goodguy2.values))
//                         d3.select("#cdfeliteguyline").attr("d",line(eliteguy2.values))
//                         d3.select("#cdftitle").text("Points / Year");


//                       } else {
//                             relbutton.attr("fill","white")
//                             reltext.text("Toggle Year")
//                             xAxis.scale(x)
//                                 .ticks(range)
//                             svg.selectAll("g .x.axis")
//                                 .transition().duration(1000)
//                                .call(xAxis);
//                             var sel = d3.select("body").transition();
//                                 cdf_dataGroup.forEach(function(d, i) {
//                                     sel.select("#path_"+d.key)
//                                        .duration(1500)
//                                        .attr("d",line(d.values))
//                             });
//                             d3.select("#cdfavgjoeline").attr("d",line(avgjoe.values))
//                             d3.select("#cdfgoodguyline").attr("d",line(goodguy.values))
//                             d3.select("#cdfeliteguyline").attr("d",line(eliteguy.values))
//                             d3.select("#cdftitle").text("Points / Season");

//                       }
//                   });
//   //not sure what this is about
// } // Close function generateLineChart


// function updateCDFData(cdf_data){

//   d3.select(".x axis").remove();
//   d3.select(".y axis").remove();
//   d3.selectAll(".cdf_line").remove();
//   d3.select("#lrg-sec-1 svg").remove();

//   generateCDF_D3Chart(cdf_data);
// }

// function CDFcheckColor(color_attr){
//     blue = d3.rgb("#1f77b4")
//     orange = d3.rgb("#ff7f0e")
//     green = d3.rgb("#2ca02c")
//     ltblue = d3.rgb("#6495ed")
//     brown = d3.rgb("#f4a460")
//     lime = d3.rgb("#32cd32")
//     red = d3.rgb("#d62728")
//     fire = d3.rgb("#b22222")
//     rgb = color_attr.split("(")[1].split(")")[0].split(",")
    
//     if (+rgb[0]==red.r && +rgb[1]==red.g && rgb[2]==red.b) { return "red"}
//     if (+rgb[0]==blue.r && +rgb[1]==blue.g && rgb[2]==blue.b) { return "blue" }
//     if (+rgb[0]==orange.r && +rgb[1]==orange.g && rgb[2]==orange.b) { return "orange" }
//     if (+rgb[0]==green.r && +rgb[1]==green.g && rgb[2]==green.b) { return "green" }
//     if (+rgb[0]==ltblue.r && +rgb[1]==ltblue.g && rgb[2]==ltblue.b) { return "cornflowerblue" }
//     if (+rgb[0]==brown.r && +rgb[1]==brown.g && rgb[2]==brown.b) { return "sandybrown" }
//     if (+rgb[0]==lime.r && +rgb[1]==lime.g && rgb[2]==lime.b) { return "limegreen" }
//     if (+rgb[0]==fire.r && +rgb[1]==fire.g && rgb[2]==fire.b) { return "firebrick" }
//     return false
// }

  var margin = { top: 45, right: 30, bottom: 50, left: 45 }
    , width = parseInt(d3.select('.large-chart').style('width'), 10)
    , width = width - margin.left - margin.right
    , height = parseInt(d3.select('.large-chart').style('height'), 10)
    , height = height - margin.top - margin.bottom;

  var absyear = false;
  var parseDate = d3.time.format("%Y").parse;

  var xTime = d3.time.scale()
                  .range([0, width]);

  var x = d3.scale.linear().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);

  var color = d3.scale.category10();

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) {
        if (absyear == false){
          return x(d.x);
        }
          return xTime(d.year)
      })
      .y(function(d) {
            return y(d.y);
      });

      // .x(function(d) { return x(d.x); })
      // .y(function(d) { return y(d.y); });

  var cdf_svg = d3.select("#lrg-sec-1").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // var selected_players = filteredPlayers();
  // // console.log(selected_players);
  // var filter_string = '?players=';
  // selected_players.forEach(function (d){
  //   filter_string += (','+d.pguid);
  // });
  // console.log(filter_string);

  var cdf_data_conv;

  // d3.json('http://localhost:8000/seasons_subset/'+filter_string, function(error,cdf_data){
  //   if (error) throw error;

    cdf_data_conv = convertData(data);

    var keys = d3.keys(cdf_data_conv);
    color.domain(d3.keys(cdf_data_conv));

    x.domain([
      0,
      d3.max(cdf_data_conv, function(d) { return d.values.length; })  // Want the longest length career
    ]);

    xTime.domain(d3.extent(cdf_data_conv, function(d) {return d.year;}));

    y.domain([
      d3.min(cdf_data_conv, function(d) { return d3.min(d.values, function(v) { return v.y; }); }),
      d3.max(cdf_data_conv, function(d) { return d3.max(d.values, function(v) { return v.y; }); })
    ]);

    cdf_svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (width/2) +","+height+")")
          .text("Years Played");

    cdf_svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Cumulative Fantasy Points");

//  *****************************************************
//  CIRCLES FOR DETAILS ON DEMAND MOUSE HOVER
// ******************************************************
    var focus = cdf_svg.append("g")
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



    var player = cdf_svg.selectAll(".player")
        .data(cdf_data_conv)
      .enter().append("g")
        .attr("class", "player");

    player.append("path")
        // .attr("class", "line")
        .attr("class", "cdf_line")
        .attr("d", function(d) { return line(d.values); })
        .attr("id" , function(d){
          var key_updated = d.key.toString();
          if(key_updated.indexOf('.') != -1) {
            console.log(key_updated);
            key_updated = key_updated.replace('.', '');
            console.log(key_updated);
          }
              // var key_updated = d.key.toString().replace('.', '');
              // console.log(key_updated);
              return 'path_' + key_updated;
        })
        .attr("stroke-linecap","round")
        .style("stroke", function(d) { return d3.hsl('#dddddd') })
           .on("click", function() {
                var splice_index = selected_pguids.indexOf(d3.select(this).key);
                if(splice_index == -1){
                  // Add it because you clicked it
                  console.log("Added from cdf");
                  selected_pguids.push(d3.select(this).key);
                } else {
                  // Remove it because you double clicked it
                  // console.log("Removing pguid: " + d.key);
                  // console.log(selected_pguids);
                  // console.log("Removing index: " + splice_index);
                  // console.log(splice_index);
                  console.log("Removed from cdf");
                  selected_pguids.splice(splice_index, 1);
                  // console.log(selected_pguids);
                }

                // Notifies everyone else to highlight/unhighlight
                dispatch.project_click();

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
           })        
        .on('mouseover', function(d) {
            var line = d3.select(this);
//             line.style('stroke', colorScale(PGUID_TO_NAME_MAP[d.key][1]))
//             // line.style('stroke', d3.hsl('#33b9ff'));
//             this.parentNode.parentNode.appendChild(this.parentNode);
//             d3.select(this.nextSibling)
//               .attr("opacity", "1")
//         })
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
        .on('mouseout', function(d) {
//             console.log(d);
//             var line = d3.select(this);
//             line.style('stroke', d3.hsl('#dddddd'));
//             line.moveToBack();
//             d3.select(this.nextSibling)
//               .attr("opacity", "0")
//         });
        focus.style("display", "none");
//                             iline.style("stroke","whitesmoke");
        var sel = d3.select(this);
        sel.transition().duration(100)
            .ease("bounce").style("stroke-width", "2px")
        color_attr = d3.select(this).style("stroke")
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
//       .on("mousemove", function(){
//             if (absyear == true) {
//                 var rawX = xTime.invert(d3.mouse(this)[0])
//                 var year = rawX.getFullYear()
//                 relyear = year - d.values[0].real_year.getFullYear()
//                 var pts = d.values[relyear].season_ff_pts
//                 var yr_date = parseDate(year.toString())
//             } else {
//                 var rawX = x.invert(d3.mouse(this)[0])
//                 var year = Math.round(rawX)
//                 var pts = d.values[year-1].season_ff_pts
//             }
//             var totpts = 0
//             var totyears = d.values.length
//             var bestyr = -10000
//             var worstyr = 10000
//             for (var i = 0; i < totyears; i++) {
//                 totpts += d.values[i].season_ff_pts
//                 if (d.values[i].season_ff_pts > bestyr) {
//                     bestyr = d.values[i].season_ff_pts
//                 }
//                 if (d.values[i].season_ff_pts < worstyr) {
//                     worstyr = d.values[i].season_ff_pts
//                 }
//             }
//             var avg = Math.round(totpts/totyears)
//             if (absyear == true) {
//                 focus.attr("transform", "translate(" + xTime(yr_date) + "," + y(pts) + ")")
//             } else {
//                 focus.attr("transform", "translate(" + x(year) + "," + y(pts) + ")")
//             }
//             fullname = PGUID_TO_NAME_MAP[d.key][0]
//             focus.select("#focusname").text(fullname);
//             focus.select("#focusyear").text("Yr: "+year);
//             focus.select("#focuspoints").text("Pts:"+pts);
//             focus.moveToFront();
//             nameline.select("text").text("Name: " + fullname);
//             yearline.select("text").text("Years: " + totyears + "......  Total Points: " + totpts);
//     //                             pointsline.select("text").text("Total Points: " + totpts);
//             averageline.select("text").text("Average/Season: " + avg + " (Best: "+bestyr+", Worst: " + worstyr+")");
//             d3.select("#nameline").moveToFront()
//             d3.select("#yearline").moveToFront()
//             d3.select("#pointsline").moveToFront()
//             d3.select("#averageline").moveToFront()
//         });

//     });


        // Set them to not show at first
        d3.selectAll(".cdf_line").style("opacity","0");
        animateLines();

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

    player.append("text")
        .datum(function(d_sub) {
          // console.log("TEST STRING PRIOR");
          // console.log(d_sub);
          return {name: PGUID_TO_NAME_MAP[d_sub.key][0], value: d_sub.values[d_sub.values.length - 1]}; })
        .attr("transform", function(d_sub) { return "translate(" + x(d_sub.value.x) + "," + y(d_sub.value.y) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d_sub) { return d_sub.name + ' (' + d_sub.value.y + ') ' ; })
        .attr("opacity", "0");

        var cdfyrtog = cdf_svg.append("rect")
                          .attr("class","button")
                          .attr("id","elitebut")
                          .attr("x", width-margin.right-30)
                          .attr("y", 10)
                          .attr("rx",width/30)
                          .attr("ry",height/30)
                          .attr("width", width/10)
                          .attr("height", height/15)
                          .attr("stroke","black")
                          .attr("fill","yellow")
                          .on("click",function(){
                            absyear = !absyear;
                            // absyear = absyear ? false : true;
                            if (absyear) {
                              cdfyrtog.text("Relative")
                            xTime.domain(d3.extent(cdf_data_conv, function(d) {return d.year;}));
                              xAxis.scale(xTime);
                              cdf_svg.select("g .x.axis")
                                 .call(xAxis);
                              var sel = d3.select("body").transition();
                              console.log(cdf_data_conv)
                              cdf_data_conv.forEach(function(d){
                                var key_updated = d.key.toString();
                                if(key_updated.indexOf('.') != -1){
                                  console.log(key_updated);
                                  key_updated = key_updated.replace('.', '');
                                  console.log(key_updated);
                                }
                                // console.log(d.values);
                                // var temp = sel.select("#path_"+key_updated);
                                // console.log(temp);
                                console.log(sel.select("#path_"+key_updated))
                                console.log(d.values)
                                sel.select("#path_"+key_updated)
//                                    .duration(1500)
                                   .attr("d", line(d.values));
                              });
                            } else {
                              cdfyrtog.text("Years")
                              xAxis.scale(x);
                              cdf_svg.select("g .x.axis")
                                 .call(xAxis);
                              var sel = d3.select("body").transition();
                              cdf_data_conv.forEach(function(d){

                                var key_updated = d.key.toString();
                                if(key_updated.indexOf('.') != -1) {
                                  console.log(key_updated);
                                  key_updated = key_updated.replace('.', '');
                                  console.log(key_updated);
                                }
                                // sel.select("#path_"+key_updated)
                                //    .duration(1500)
                                //    .attr("d", line(d.values));
                              });
                            }
                        });
    // });
}

function animateLines()
{
    d3.selectAll( ".cdf_line" ).style( "opacity", "0.5" );

    //Select All of the lines and process them one by one
    d3.selectAll( ".cdf_line" ).each( function ( d, i )
    {
        // var key_updated = d.key.toString().replace( '.', '' );
        var key_updated = d.key.toString();
        if(key_updated.indexOf('.') != -1) {
          console.log(key_updated);
          key_updated = key_updated.replace('.', '');
          console.log(key_updated);
        }
        // Get the length of each line in turn
        var totalLength = d3.select( "#path_" + key_updated ).node().getTotalLength();

        d3.selectAll( "#path_" + key_updated ).attr( "stroke-dasharray", totalLength + " " + totalLength )
            .attr( "stroke-dashoffset", totalLength )
            .transition()
            .duration( 1000 )
            .delay( 10 * i )
            .ease( "quad" ) //Try linear, quad, bounce... see other examples here - http://bl.ocks.org/hunzy/9929724
            .attr( "stroke-dashoffset", 0 )
            .style( "stroke-width", 3 )
    } );

}

function updateCDFData(cdf_data){

  d3.select(".x axis").remove();
  d3.select(".y axis").remove();
  d3.selectAll(".cdf_line").remove();
  d3.select("#lrg-sec-1 svg").remove();

  generateCDF_D3Chart(cdf_data);
}

// Returns an array of objects of the form:
//  [{
//      key: pguid
//      values: arr [ x <-- year,
//                    y <-- ff_pts (cumulative)]
//
//  },...]
function convertData(cdf_data){
  var parseDate = d3.time.format("%Y").parse;

  var lines = {};
  var plot_cdf_data = [];

  if(cdf_data !== undefined && cdf_data.length > 0){
    var nameDict = {};
    for(var item in cdf_data){
      var pguid = cdf_data[item].season_guid.split("_")[0];
      var player_name;
      // console.log(player_name);
      var season_year = cdf_data[item].season_guid.split("_")[1];
      var ff_pts = cdf_data[item].season_ff_pts;
      if(!(pguid in lines)){
        // Store the start year for the first entry
        lines[pguid] = {'values': [{x: 0, 
          y: 0
         // year: parseDate(season_year)
       }]};
        // lines[pguid] = {'values': [{x: 1, y: ff_pts, year: season_year}]};
        var temp = +season_year + 1
        lines[pguid]['values'].push({x: 1, 
          y: ff_pts 
          // year: parseDate(temp.toString())
        });

      } else {
        var last = lines[pguid]['values'].length;
        // console.log(last)
        // console.log(lines[pguid]['values'])
        // var last_year = lines[pguid]['values'][last-2].year;
        // last_year = last_year.getFullYear();
        // last_year++;
        // last_year = +last_year;
        lines[pguid]['values'].push({x: last++, 
          y: ff_pts 
          // year: parseDate(last_year.toString())
        });
      }
    }

    for(var key_obj in lines){

      // Update these to be cumsum
      var vals = lines[key_obj]['values'];

      if(vals.length > 1){
        for(var i = 1; i < vals.length; i++){
          vals[i].y += vals[i-1].y;
        }
      }

      plot_cdf_data.push({key: key_obj, values: vals});

    }
  }
  // Otherwise the cdf_data's empty
  // console.log(plot_cdf_data);
  return plot_cdf_data;
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
