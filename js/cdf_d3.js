function generateCDF_D3Chart(){
  
  var cdf_margin = { top: 10, right: 30, bottom: 33, left: 45 };
  var cdf_width = 700 - cdf_margin.right - cdf_margin.left;
  var cdf_height = 400 - cdf_margin.top - cdf_margin.bottom;
  // var margin = {top: 20, right: 80, bottom: 30, left: 50},
  //   width = 960 - margin.left - margin.right,
  //   height = 500 - margin.top - margin.bottom;

  // var parseDate = d3.time.format("%Y%m%d").parse;

  var x = d3.time.scale().range([0, cdf_width]);
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
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.ff_pts); });

  var svg = d3.select("#cdf_chart").append("svg")
      .attr("width", cdf_width + cdf_margin.left + cdf_margin.right)
      .attr("height", cdf_height + cdf_margin.top + cdf_margin.bottom)
    .append("g")
      .attr("transform", "translate(" + cdf_margin.left + "," + cdf_margin.top + ")");


  d3.json('http://localhost:8000/seasons_subset/', function(error,data){
    if (error) throw error;

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

    // data.forEach(function(d) {
    //   d.date = parseDate(d.date);
    // });

    var cities = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {date: d.date, temperature: +d[name]};
        })
      };
    });

    x.domain(d3.extent(data, function(d) { return d.x; }));

    y.domain([
      d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
      d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
    ]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Temperature (ºF)");

    var city = svg.selectAll(".city")
        .data(cities)
      .enter().append("g")
        .attr("class", "city");

    city.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.name); });

    city.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });
  });

  // loadCDFChart();
}

// function loadCDFChart()
// {
//     // var playerArray = filteredPlayers();
//     d3.json('http://localhost:8000/seasons_subset/', function(error,data){
//       data_conv = convertData(data);
//       console.log(data_conv);
//       data_conv.forEach( function (x)
//       {
//           x.short_year = x.start_year;
//           x.year = yearFormat.parse( x.start_year + "" );
//           x.name = x.player_name;
//           x.pos = x.pos_type;
//           {
//             if (x.pos == "qb"){x.pos_long = "Quarterback"}
//             else if(x.pos == "rb"){x.pos_long = "Running Back"}
//             else if(x.pos == "wr"){x.pos_long = "Wide Receiver"}
//             else if(x.pos == "te"){x.pos_long = "Tight End"}
//             else {x.pos == ""}
//           };
//           x.fantPt = +x.ff_pts;
//           x.winPct = d3.round( (+x.win_pct * 100), 2 );
//       } );

//       // Scale the domain of the data
//       var xmin = d3.min(playerArray, function(d) { return d.winPct; }) - scat_xaxis_padding,
//           xmax = d3.max(playerArray, function(d) { return d.winPct; }) + scat_xaxis_padding,
//           ymin = d3.min(playerArray, function(d) { return d.fantPt; }) - scat_yaxis_padding,
//           ymax = d3.max(playerArray, function(d) { return d.fantPt; }) + scat_yaxis_padding;


//       x.domain([xmin, xmax]);
//       y.domain([ymin, ymax]);

//       // Add the scatterplot
//       svg_scatter.selectAll( "dot" )
//               .data( playerArray )
//               .enter().append( "circle" )
//               .attr( "r", 3 )
//               .attr( "cx", function ( d )
//               {
//                   return x( d.winPct );
//               } )
//               .attr( "cy", function ( d )
//               {
//                   return y( d.fantPt );
//               } )
//               .attr( "id", function ( d, i )
//               {
//                   return "dot_" + i;
//               } ) // added
//               .attr( "class", "dot" )
//               .style( "fill", function ( d )
//               {
//                   return colorScale( d.pos );
//               } )
          
//               .on( "mouseover", function ( d )
//               {
//                   d3.select( this )
//                           .attr( "stroke", "black" )
//                           .attr( "stroke-width", 2 )
//                           .attr( "fill-opacity", 1 );
//                   tooltip
//                   .style("left", (d3.event.pageX + 5) + "px")
//                   .style("top", (d3.event.pageY - 5) + "px")
//                   .transition().duration(300)
//                   .style("opacity", 1)
//                   .style("display", "block")
//                   // tooltip.html( "Name: " + d.name + "<br/>" +
//                   //         "Position: " + d.pos + "<br/>" +
//                   //         "Fantasy Pts: " + d.fantPt + "<br/>" +
//                   //         "Win %: " + d.winPct )
//                   //         .style( "left", (d3.event.pageX + 5) + "px" )
//                   //         .style( "top", (d3.event.pageY - 5) + "px" )
//                   //         .transition().duration( 300 )
//                   //         .style( "opacity", 1 )
//                   //         .style( "display", "block" );
//                   updateDetails(d);
//               } )
//               .on( "mouseout", function ( d )
//               {
//                   d3.select( this )
//                           .attr( "stroke", "" )
//                           .attr( "fill-opacity", function ( d )
//                           {
//                               return 1;
//                           } )

//                   tooltip.transition().duration( 700 ).style( "opacity", 0 );
//               } );

//       // Add the X Axis
//       svg_scatter.append( "g" )
//               .attr( "class", "x axis" )
//               .attr( "transform", "translate(0," + scatter_height + ")" )
//               .call( xAxis );

//       // Add the Y Axis
//       svg_scatter.append( "g" )
//               .attr( "class", "y axis" )
//               .call( yAxis );

//       lasso.items( d3.selectAll( ".dot" ) );
//     });
// }

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
    // console.log(key);

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