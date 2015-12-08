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
    datalist = convertData(data);
    history_data_conv = datalist[0]
    var min = datalist[1]
    var max = datalist[2]

    var classlist = {}
    var yearlist = {}
    var classcnt = {}
    var yearcnt = {}

    for (var i = 0; i < history_data_conv.length; i++){
        player = history_data_conv[i]
        startyear = player.values[0].year
        if (!(startyear in classlist)) {
            classlist[startyear] = 0
            classcnt[startyear] = 0
        }
        classlist[startyear] += player.values[ player.values.length - 1].y
        classcnt[startyear] += 1
    }
    for (var i = 0; i < data.length; i++){
        player = data[i]
        year = +player["season_guid"].split("_")[1]
        if (!(year in yearlist)) {
            yearlist[year] = 0
            yearcnt[year] = 0
        }
        yearlist[year] += player.season_ff_pts
        yearcnt[year]++
    }

    groupavg = {}
    groupavg.key = "groupavg"
    groupavg.values = []
    $.each(yearlist, function(key, value){
        year = key
        season_pts = Math.round(yearlist[key]/yearcnt[key])
        year = parseDate(year.toString())
        groupavg.values.push({"season_ff_pts":season_pts, "real_year":year})
    })
    
    var groupavg2 = {}
    groupavg2.key = "groupavg2"
    groupavg2.values = []
    $.each(classlist, function(key, value){
        year = key
        class_pts = Math.round(classlist[key]/classcnt[key])
        year = parseDate(key.toString())
        groupavg2.values.push({"season_ff_pts":class_pts, "real_year":year})
    })
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
                                cnts = yearcnt[year]
                                y.domain(d3.extent(groupavg.values, function(d) { return d.season_ff_pts; }));

                            } else {
                                for (var j = 0; j < groupavg2.values.length; j++ ) {
                                    grp_year = groupavg2.values[j].real_year.getFullYear()
                                    if (grp_year == year) { break }
                                }
                                pts = groupavg2.values[j].season_ff_pts
                                cnts = classcnt[year]
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

function convertData(history_data){
  var parseDate = d3.time.format("%Y").parse;

  var lines = {};
  var plot_history_data = [];
  var min = 10000
  var max = -10000
  if(history_data !== undefined && history_data.length > 0){
    var nameDict = {};
    for(var item in history_data){
      var pguid = history_data[item].season_guid.split("_")[0];
      var player_name;
      // console.log(player_name);
      var season_year = history_data[item].season_guid.split("_")[1];
      if (+season_year < min) { min = +season_year}
      var ff_pts = history_data[item].season_ff_pts;
      if(!(pguid in lines)){
        // Store the start year for the first entry
        lines[pguid] = {'values': [{x: 0, 
          y: 0,
         year: +season_year
       }]};
//         lines[pguid] = {'values': [{x: 1, y: ff_pts, year: season_year]};
        var temp = +season_year + 1
        lines[pguid]['values'].push({x: 1, 
          y: ff_pts,
          year: +season_year + 1
        });

      } else {
        var last = lines[pguid]['values'].length;
        // console.log(last)
        // console.log(lines[pguid]['values'])
        // var last_year = lines[pguid]['values'][last-2].year;
        // last_year = last_year.getFullYear();
        // last_year++;
        // last_year = +last_year;
        last_year = lines[pguid]['values'][0].year + last
        if (last_year > max) { max = last_year }
        lines[pguid]['values'].push({x: last++, 
          y: ff_pts ,
          year: last_year
        });
      }
      console.log(lines[pguid])
    }

    for(var key_obj in lines){

      // Update these to be cumsum
      var vals = lines[key_obj]['values'];

      if(vals.length > 1){
        for(var i = 1; i < vals.length; i++){
          vals[i].y += vals[i-1].y;
        }
      }

      plot_history_data.push({key: key_obj, values: vals});

    }
  }
  // Otherwise the history_data's empty
  // console.log(plot_history_data);
  return [plot_history_data, min, max];
}