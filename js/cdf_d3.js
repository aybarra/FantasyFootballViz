function generateCDF_D3Chart(data){

  var absyear = false;
  var parseDate = d3.time.format("%Y").parse;

  var xTime = d3.time.scale()
                  .range([0, cdf_width]);

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
      .x(function(d) {
        if (absyear == false){
          return x(d.x);
        } else if(absyear == true && d.year !== NaN){
          return xTime(d.year)
        }
      })
      .y(function(d) {
          if(d.year !== NaN){
            return y(d.y);
          }
      });

      // .x(function(d) { return x(d.x); })
      // .y(function(d) { return y(d.y); });

  var cdf_svg = d3.select("#lrg-sec-1").append("svg")
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

  var data_conv;

  // d3.json('http://localhost:8000/seasons_subset/'+filter_string, function(error,data){
  //   if (error) throw error;

    data_conv = convertData(data);

    var keys = d3.keys(data_conv);
    color.domain(d3.keys(data_conv));

    x.domain([
      0,
      d3.max(data_conv, function(d) { return d.values.length; })  // Want the longest length career
    ]);

    xTime.domain(d3.extent(data_conv, function(d) {return d.year;}));

    y.domain([
      d3.min(data_conv, function(d) { return d3.min(d.values, function(v) { return v.y; }); }),
      d3.max(data_conv, function(d) { return d3.max(d.values, function(v) { return v.y; }); })
    ]);

    cdf_svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + cdf_height + ")")
        .call(xAxis)
        .append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate("+ (cdf_width/2) +","+cdf_height+")")
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

    var player = cdf_svg.selectAll(".player")
        .data(data_conv)
      .enter().append("g")
        .attr("class", "player");

    player.append("path")
        // .attr("class", "line")
        .attr("class", "cdf_line")
        .attr("d", function(d) { return line(d.values); })
        .attr("id" , function(d){
              var key_updated = d.key.toString().replace(/\./g, '');
              // console.log(key_updated);
              return 'path_' + key_updated;
        })
        .attr("stroke-linecap","round")
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
          return {name: PGUID_TO_NAME_MAP[d_sub.key][0], value: d_sub.values[d_sub.values.length - 1]}; })
        .attr("transform", function(d_sub) { return "translate(" + x(d_sub.value.x) + "," + y(d_sub.value.y) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d_sub) { return d_sub.name + ' (' + d_sub.value.y + ') ' ; })
        .attr("opacity", "0");

    var yrtog = d3.select("#cdf_year_swap")
            .on("click",function(){
                absyear = !absyear;
                // absyear = absyear ? false : true;
                if (absyear) {
                  yrtog.text("Relative")
                  xAxis.scale(xTime);
                  cdf_svg.select("g .x.axis")
                     .call(xAxis);
                  var sel = d3.select("body").transition();
                  data_conv.forEach(function(d){
                    var key_updated = d.key.toString().replace(/\./g, '');
                    // console.log(d.values);
                    // var temp = sel.select("#path_"+key_updated);
                    // console.log(temp);
                    // console.log(d.values);
                    sel.select("#path_"+key_updated)
                       .duration(1500)
                       .attr("d", line(d.values));
                  });
                } else {
                  yrtog.text("Years")
                  xAxis.scale(x);
                  cdf_svg.select("g .x.axis")
                     .call(xAxis);
                  var sel = d3.select("body").transition();
                  data_conv.forEach(function(d){
                    var key_updated = d.key.toString().replace(/\./g, '');
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
        var key_updated = d.key.toString().replace( /\./g, '' );
        // Get the length of each line in turn
        var totalLength = d3.select( "#path_" + key_updated ).node().getTotalLength();

        d3.selectAll( "#path_" + key_updated ).attr( "stroke-dasharray", totalLength + " " + totalLength )
            .attr( "stroke-dashoffset", totalLength )
            .transition()
            .duration( 2000 )
            .delay( 10 * i )
            .ease( "quad" ) //Try linear, quad, bounce... see other examples here - http://bl.ocks.org/hunzy/9929724
            .attr( "stroke-dashoffset", 0 )
            .style( "stroke-width", 3 )
    } );

}

function updateCDFData(data){

  d3.select(".x axis").remove();
  d3.select(".y axis").remove();
  d3.selectAll(".cdf_line").remove();
  d3.select("#cdf_chart svg").remove();
  
  generateCDF_D3Chart(data);
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

  if(data !== undefined && data.length > 0){
    var nameDict = {};
    for(var item in data.results){
      var pguid = data.results[item].season_guid.split("_")[0];
      var player_name;
      // console.log(player_name);
      var season_year = data.results[item].season_guid.split("_")[1];
      var ff_pts = data.results[item].season_ff_pts;
      if(!(pguid in lines)){
        lines[pguid] = {'values': [{x: 0, y: 0, year: NaN}]};
        // lines[pguid] = {'values': [{x: 1, y: ff_pts, year: season_year}]};
        lines[pguid]['values'].push({x: 1, y: ff_pts, year: d3.time.format("%Y").parse(season_year)});

      } else {
        var last = lines[pguid]['values'].length;
        lines[pguid]['values'].push({x: last++, y: ff_pts, year: d3.time.format("%Y").parse(season_year)});
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
  }
  // Otherwise the data's empty
  // console.log(plot_data);
  return plot_data;
}
