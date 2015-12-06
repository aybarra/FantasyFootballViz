function generateCDF_D3Chart(){

  var x = d3.scale.linear().range([0, cdf_width]);
  var y = d3.scale.linear().range([cdf_height, 0]);

  var color = d3.scale.category10();

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return x(d.x); })
      .y(function(d) { return y(d.y); });

  var svg = d3.select("#cdf_chart").append("svg")
      .attr("width", cdf_width + cdf_margin.left + cdf_margin.right)
      .attr("height", cdf_height + cdf_margin.top + cdf_margin.bottom)
      .append("g")
      .attr("transform", "translate(" + cdf_margin.left + "," + cdf_margin.top + ")");

  var selected_players = filteredPlayers();
  // console.log(selected_players);
  var filter_string = '?players=';
  selected_players.forEach(function (d){
    filter_string += (','+d.pguid);
  });
  // console.log(filter_string);

  d3.json('http://localhost:8000/seasons_subset/'+filter_string, function(error,data){
    if (error) throw error;

    var data_conv = convertData(data);

    var keys = d3.keys(data_conv);
    color.domain(d3.keys(data_conv));

    x.domain([
      0,
      d3.max(data_conv, function(d) { return d.values.length; })  // Want the longest length career
    ]);

    y.domain([
      d3.min(data_conv, function(d) { return d3.min(d.values, function(v) { return v.y; }); }),
      d3.max(data_conv, function(d) { return d3.max(d.values, function(v) { return v.y; }); })
    ]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + cdf_height + ")")
        .call(xAxis)
        .append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (cdf_width/2) +","+cdf_height+")")
          .text("Years Played");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Cumulative Fantasy Points");

    var player = svg.selectAll(".player")
        .data(data_conv)
      .enter().append("g")
        .attr("class", "player");

    player.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .attr("id" , function(d){
              // console.log(d);
              return 'path_' + d.key;
        })
        .style("stroke", function(d) { return d3.hsl('#dddddd') })
        .on('mouseover', function(d) { 
            var line = d3.select(this);
            line.style('stroke', colorScale(PGUID_TO_NAME_MAP[d.key][1]))
            // line.style('stroke', d3.hsl('#33b9ff'));
            this.parentNode.parentNode.appendChild(this.parentNode);  
            d3.select(this.nextSibling)
              .attr("opacity", "1")  
        })
        .on('mouseout', function(d) { 
            // console.log(d);
            var line = d3.select(this);
            line.style('stroke', d3.hsl('#dddddd'));
            // line.moveToBack();
            d3.select(this.nextSibling)
              .attr("opacity", "0")
        });
        
    dispatch.on("lasso", function(lassoed_items) {
      // console.log(lassoed_items);
      if(lassoed_items.length > 0){
        lassoed_items.forEach(function (d){
          // console.log("Pguid is: " + d.pguid);
          d3.select('#path_' + d.pguid)
          .style('stroke-width','3px');
        });
      } else {
        var paths = d3.selectAll("*[id^='path']");
        // console.log(paths);
        paths.style('stroke-width', '1.5px');
      }
    });

    player.append("text")
        .datum(function(d_sub) { 
          // console.log(d_sub.key);
          return {name: PGUID_TO_NAME_MAP[d_sub.key][0], value: d_sub.values[d_sub.values.length - 1]}; })
        .attr("transform", function(d_sub) { return "translate(" + x(d_sub.value.x) + "," + y(d_sub.value.y) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d_sub) { return d_sub.name + ' (' + d_sub.value.y + ') ' ; })
        .attr("opacity", "0");
    });
}

// Returns an array of objects of the form:
//  [{
//      key: pguid
//      values: arr [ x <-- year,
//                    y <-- ff_pts (cumulative)]
//
//  },...]
function convertData(data){
  var lines = {};
  var plot_data = [];

  var nameDict = {};
  for(var item in data.results){
    var pguid = data.results[item].season_guid.split("_")[0];
    var player_name;
    // if(nameDict[pguid] === undefined){
    //   d3.json('http://localhost:8000/careers/' + pguid, function(error,data){
    //     // console.log(data);
    //     nameDict[pguid] = data['player_name'];
    //   });
    // }
    // console.log(player_name);
    var season_year = data.results[item].season_guid.split("_")[1];
    var ff_pts = data.results[item].season_ff_pts;
    if(!(pguid in lines)){
      lines[pguid] = {'values': [{x: 0, y: 0, year: NaN}]};
      // lines[pguid] = {'values': [{x: 1, y: ff_pts, year: season_year}]};
      lines[pguid]['values'].push({x: 1, y: ff_pts, year: season_year});

    } else {
      var last = lines[pguid]['values'].length;
      lines[pguid]['values'].push({x: last++, y: ff_pts, year: season_year});
    }
  }
  // console.log(lines);

  for(var key_obj in lines){

    // Update these to be cumsum
    var vals = lines[key_obj]['values'];

    if(vals.length > 1){
      for(var i = 1; i < vals.length; i++){
        vals[i].y += vals[i-1].y;
      }
    }

    plot_data.push({key: key_obj, values: vals});

  }
  // console.log(plot_data);
  return plot_data;
}
