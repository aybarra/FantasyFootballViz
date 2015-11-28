function tooltip(key) {
  console.log(key);
  return 'Custom Tooltip<br/>' +
           '<h3>' + key.toString() + '</h3>' +
           '<p>' +  y + ' on ' + x + '</p>';
};

function generateCDFChart() {
    var chart;
    // var rate = [{key:"Exchange Rate against USD", values:[]}];
    d3.json('http://localhost:8000/seasons_subset/?starts_with=MannPe00&starts_with=BradTo', function(error,data){
      
          // .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
                    // .tooltips(true)        //Don't show tooltips
                    // .showValues(true)       //...instead, show the bar value right on top of each bar.
                    // .tooltipContent(function(key, y, e, graph) { return 'Some String'; })
        nv.addGraph(function() {
            chart = nv.models.lineChart()
                    // .useInteractiveGuideline(true)
                    .x(function(d) { 
                      if(d !== undefined){
                        return d.x;
                      } else {
                        return 0;
                      }
                    })    //Specify the data accessors.
                    .y(function(d) { 
                      if(d !== undefined){
                        return d.y 
                      } else {
                        return 0;
                      }
                    })
                    .color(d3.scale.category10().range())
                    .options({
                      transitionDuration: 300,
                      useInteractiveGuideline: false,
                      clipVoronoi: true,
                      useVoronoi: true,
                      useInteractiveGuideline: true,
                      showLegend: false
                    });

                    chart.tooltip.enabled(true);
                    chart.tooltip.contentGenerator(tooltip);

                    chart.xAxis
                      .axisLabel("Season count")
                      .tickFormat(d3.format(',.0d'))
                      .staggerLabels(true);

                    chart.yAxis
                      .axisLabel('Cumulative Fantasy Points');
                    // .transitionDuration(350)
                    // .tooltipContent(function(key, y, e, graph) { return 'Some String'; })
                    // .duration(300)

                    // .clipVoronoi(false)
                    // .showVoronoi(true)
                    // .showLegend(false)
                    // .color(d3.scale.category10().range())
                    // .showYAxis(true)        //Show the y-axis
                    // .showXAxis(true);
 
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
    var season_year = data.results[item].season_guid.split("_")[1];
    var ff_pts = data.results[item].season_ff_pts;
    if(!(pguid in lines)){
      lines[pguid] = {'values': [{x: 0, y: 0, year: "drafted"}]};
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