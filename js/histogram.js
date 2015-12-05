function generateHistogram(){

    var dataset = [];

    var parseDate = d3.time.format("%Y").parse;
    var color = d3.scale.category10();


    var margin = {top: 20, right: 20, bottom: 40, left: 50},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

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

    var svg = d3.select("#seasonal_line").append("svg")
                .attr("id","seasonal_line")
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
//  GET DATA AND MANIPULATE IT
// ******************************************************
    var careerlist = []
    var tot_players = 0
    var tot_points = 0
    var avg_player
    var std_dev

    d3.json('http://localhost:8000/careers/', function(error,data){
        if (error) throw error;
          
        data.results.forEach(function(d,i) {
             careerlist.push(d.ff_pts)
             tot_players += 1
             tot_points += d.ff_pts
        });
        
        avg_player = Math.round(tot_points / tot_players)
        std_dev = math.std(careerlist)
    });

   var dataset = d3.layout.histogram()
                    .bins(x.ticks(20))
                    (careerlist);

//  *****************************************************
//  BUILD AXIS 
// ******************************************************
    var xAxis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom");

   var dataset = d3.layout.histogram()
                    .bins(x.ticks(20))
                    (careerlist);

    var yAxis = d3.svg.axis()
                  .scale(y)
                  .orient("left");

    x.domain(d3.extent(careerlist));
    y.domain([0, d3.max(data, function(d) { return d.y; })])
//     x.domain([1,d3.max(dataset, function(d) { return d.year; })]);
//     y.domain([0,d3.max(dataset, function(d) { return d.season_ff_pts; })]);


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
       .style("text-anchor", "end");

//  *****************************************************
//  BUILD THE HISTOGRAM
// ******************************************************                        
        var bar = svg.selectAll(".bar")
                    .data(dataset)
                    .enter().append("g")
                    .attr("class", "bar")
                    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

        bar.append("rect")
            .attr("x", 1)
            .attr("width", x(data[0].dx) - 1)
            .attr("height", function(d) { return height - y(d.y); });

        bar.append("text")
            .attr("dy", ".75em")
            .attr("y", 6)
            .attr("x", x(data[0].dx) / 2)
            .attr("text-anchor", "middle")
            .text(function(d) { return formatCount(d.y); });

//  *****************************************************
//  BUTTONS TO TOGGLE THE REFERENCE LINE
// ******************************************************
 //    b_height = height+margin.bottom+margin.top
//     
//     var d_button = d3.select("body").append("button")
//                      .attr("class","button")
//                      .style("position","relative")
//                      .style("left", -width-20+"px")
//                      .text("Average Player")
//                      .on("click",function(){
//                             var active = avgjoeline.active ? false : true;
//                             var opacity = active ? 0 : 1;
//                             d3.select("#avgjoeline").style("opacity", opacity);
//                             avgjoeline.active = active;
//                      });
//         
//     d3.select("body").append("button")
//                      .attr("class","button")
//                      .style("position","relative")
//                      .style("left", -width+"px")
//                      .style("width","60px")
//                      .text("Good")
//                      .on("click",function(){
//                             var active = goodguyline.active ? false : true;
//                             var opacity = active ? 0 : 1;
//                             d3.select("#goodguyline").style("opacity", opacity);
//                             goodguyline.active = active;                
//                      });
//         
//     d3.select("body").append("button")
//                      .attr("class","button")
//                      .style("position","relative")
//                      .style("top",-24+"px")
//                      .style("left", 240+"px")
//                      .style("width","60px")
//                      .text("Elite")
//                      .on("click",function(){
//                             var active = eliteguyline.active ? false : true;
//                             var opacity = active ? 0 : 1;
//                             d3.select("#eliteguyline").style("opacity", opacity);
//                             eliteguyline.active = active;
//                      });
// 
//     var yrtog = d3.select("body").append("button")
//                   .attr("class","button")
//                   .style("position","relative")
//                   .style("top",-24+"px")
//                   .style("left", width+"px")
//                   .text("Years")
//                   .on("click",function(){
//                       absyear = absyear ? false : true;
//                       if (absyear) {
//                         yrtog.text("Relative")
//                         xAxis.scale(xTime);
//                         svg.selectAll("g .x.axis")
//                            .call(xAxis);
//                         var sel = d3.select("body").transition();
//                         dataGroup.forEach(function(d, i) {
//                             sel.select("#"+d.key)
//                                .duration(1500)
//                                .attr("d",line(d.values))
//                         });
//                       } else {
//                             yrtog.text("Years")
//                             xAxis.scale(x);
//                             svg.selectAll("g .x.axis")
//                                .call(xAxis);
//                             var sel = d3.select("body").transition();
//                                 dataGroup.forEach(function(d, i) {
//                                     sel.select("#"+d.key)
//                                        .duration(1500)
//                                        .attr("d",line(d.values))
//                             });
//                       }
//                   });
;  //not sure what this is about
} // Close function generateLineChart