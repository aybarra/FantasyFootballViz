function generateCDFChart() {
    var chart;
    // var rate = [{key:"Exchange Rate against USD", values:[]}];
    d3.json('http://localhost:8000/seasons_subset/', function(error,data){

          // .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
                    // .tooltips(true)        //Don't show tooltips
                    // .showValues(true)       //...instead, show the bar value right on top of each bar.
                    // .tooltipContent(function(key, y, e, graph) { return 'Some String'; })
        nv.addGraph(function() {
            chart = nv.models.lineChart()
                    // .useInteractiveGuideline(true)
                    .x(function(d) { return d.x })    //Specify the data accessors.
                    .y(function(d) { return d.y })
                    // .transitionDuration(350)
                    .duration(300)
                    .clipVoronoi(false)
                    .showLegend(false)
                    .color(d3.scale.category10().range())
                    .showYAxis(true)        //Show the y-axis
                    .showXAxis(true);

            // generateChart(chart);
            d3.select('#cdf_chart svg')//'#chart svg')
                    .datum(convertData(data))
                    .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });
    })
}

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
