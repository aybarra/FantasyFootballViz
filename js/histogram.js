function generateHistogram( careers, season_subset_data )
{
    var temp_data = jQuery.extend(true, {}, careers);
    var hgram_careers = []
    for (var key in temp_data) {
        hgram_careers.push(temp_data[key])
    }

    var temp_data = jQuery.extend(true, {}, season_subset_data);
    var hgram_season_subset_data = []
    for (var key in temp_data) {
        hgram_season_subset_data.push(temp_data[key])
    }

    var numbins = 9
    var binning = [ 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000 ]
    var binsize = 500
    var binclicks = [false, false, false, false, false, false, false, false, false, false]
// Generate a Bates distribution of 10 random variables.
    var careerlist = []
    var players = []
    var tot_players = 0
    var tot_points = 0
    var avg_player
    var std_dev
    var yeartuples = []

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

    hgram_careers.forEach( function ( d, i )
    {
        players.push([d.ff_pts,d])
        if( d.ff_pts != 0 )
        {
            careerlist.push( d.ff_pts )
            tot_players += 1
            tot_points += d.ff_pts
        }
    } );

    players.sort( function ( a, b )
    {
        a = a[ 0 ];
        b = b[ 0 ];
        return a < b ? -1 : (a > b ? 1 : 0);
    } );
    console.log(players)
    var curyear = 0
    var years = []
    var yearlist = []
    var templist = []

    // A formatter for counts.
    var formatCount = d3.format( ",.0f" );

    var margin = { top: 50, right: 30, bottom: 33, left: 45 }
        , width = parseInt( d3.select( '.small-chart' ).style( 'width' ), 10 )
        , width = width - margin.left - margin.right
        , height = parseInt( d3.select( '.small-chart' ).style( 'height' ), 10 )
        , height = height - margin.top - margin.bottom;

    maxscore = d3.max(careerlist)
    maxrnd = Math.ceil(maxscore / 100) * 100
    binsize = maxrnd / 10
    binning = []
    for (var i = 0; i < numbins; i++) {
        nextbin = (i+1) * binsize
        binning.push(nextbin)
    }
    binList = CalcBins( careerlist, numbins, binsize )
    playerbins = CalcPlayerBins(players, numbins, binsize)
    var totals = [0,0,0,0]
    var piestuff = []
    for (var i = 0; i < playerbins.length; i++) {
        piestuff.push([0,0,0,0])
        if (playerbins[i].length > 0){
            for (var j = 0; j < playerbins[i].length; j++) {
                pos = playerbins[i][j][1].pos_type
                if (pos == 'qb') { piestuff[i][0]++; totals[0]++ }
                if (pos == 'rb') { piestuff[i][1]++ ; totals[1]++ }
                if (pos == 'wr') { piestuff[i][2]++ ; totals[2]++ }
                if (pos == 'te') { piestuff[i][3]++ ; totals[3]++ }
            }
        }
    }
    console.log(totals)
    console.log(piestuff)
    var x = d3.scale.linear()
        .domain( [ 0, maxrnd ] )
        .range( [ 0, width ] );

    var y = d3.scale.linear()
        .domain( [ 0, d3.max( binList, function ( d )
        {
            return d;
        } ) ] )
        .range( [ height, 0 ] );

    var relx = d3.scale.linear()
               .range([0, width+margin.left+margin.right])
               .domain([0,100])

    var rely = d3.scale.linear()
              .range([parseInt( d3.select( '.small-chart' ).style( 'height' ), 10 ), 0])
              .domain([0,100])


    var xAxis = d3.svg.axis()
        .scale( x )
        .tickValues( binning )
        .tickFormat( d3.format( "d" ) )
        .orient( "bottom"    );

    var svg = d3.select( "#sm-sec-1" ).append( "svg" )
        .attr( "width", width + margin.left + margin.right )
        .attr( "height", height + margin.top + margin.bottom )
        .append( "g" )
        .attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );

    svg.append("text")
        .attr("id","histogramtitle")
        .attr("x", width/2)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Cumulative Points Distribution");

    var radius = Math.min(70, 70) / 2;
    var piecolor = d3.scale.ordinal()
               .range(['#1f77b4', '#d62728', '#ff7f0e', '#2ca02c']); 
    
    var arc = d3.svg.arc()
      .outerRadius(radius);

    var pie = d3.layout.pie()
      .value(function(d) { return d; })
      .sort(null);

    var bar = svg.selectAll( ".bar" )
        .data( playerbins )
        .enter().append( "g" )
        .attr( "class", "bar" )
        .attr("id",function (d, i) {
            return "bar_"+i
        })
        .attr( "transform", function ( d, i )
        {
            return "translate(" + x( i * binsize ) + "," + y( d.length ) + ")";
        } );

    bar.append( "rect" )
        .attr( "x", 1 )
        .attr( "width", x( binsize ) - 1 )
        .attr( "height", function ( d )
        {
            return height - y( d.length );
        } )
        .attr( "stroke", "black" )
        .attr( "fill", "lightgray")
        .on("click", function(d, i) {
            var active = d.active ? false : true
            var pguidList = []
            console.log(active, [i])
            for (var i = 0; i < d.length; i++){
                var temp = d[i][1].pguid.replace('.','')
                pguidList.push( temp)
            }
            if (active == true) {
                d3.select(this).style("stroke","yellow").style("stroke-width","3px")    
                addSelected( pguidList )
                dispatch.project_click()
            } else {
                d3.select(this).style("stroke","black").style("stroke-width","1px")    
                removeSelected( pguidList )
                dispatch.project_click()
                console.log(pguidList)
            }
            d.active = active
            console.log(active, d.active)
        })
        .on("mouseover", function (d, i) {
            d3.select(this).style("stroke","red").style("stroke-width","3px")
            var next = d3.select(this).node().nextSibling
            d3.select(next).style("stroke","red")
            d3.select(next).style("font-size","28px")
            d3.select(this).moveToFront()
//             if (d3.sum(piestuff[i]) > 0) {
//                 sel = d3.select(this)
//                         .data(piestuff[i])
//                         .enter()
//                         .append("path")
//                         .attr('d', arc)
//                         .attr('fill',function(d,i){
//                             return piecolor(i);
//                           })
//             }
        })
        .on("mouseout", function (d) {
            d3.select(this).style("stroke","black").style("stroke-width","1px")
            var next = d3.select(this).node().nextSibling
            d3.select(next).style("stroke","black")
            d3.select(next).style("font-size","16px")
            d3.select(this).moveToBack()
        })

    bar.append( "text" )
        .attr( "dy", ".06em" )
        .attr( "y", -3 )
        .attr( "x", x( binsize ) / 2 )
        .attr( "text-anchor", "middle" )
        .style( "stroke", "black" )
        .text( function ( d )
        {
            return formatCount( d.length );
        } );
        
    for (var i = 0; i < piestuff.length; i++){
        if (d3.sum(piestuff[i]) > 0) {
            var pieslice = new d3pie("#bar_"+i, {
                size: {
                        canvasHeight: 60,
                        canvasWidth:60,
                        pieInnerRadius: 0,
                        pieOuterRadius: null
                    },
                labels: {
                    outer: {
                        format: "label",
                        hideWhenLessThanPercentage: null,
                        pieDistance: -6
                    },
                    inner: {
                        format: "percentage",
                        hideWhenLessThanPercentage: null
                    },
                    mainLabel: {
                        color: "#333333",
                        font: "arial",
                        fontSize: 4
                    },
                    percentage: {
                        color: "white",
                        font: "arial",
                        fontSize: 4,
                        decimalPlaces: 0
                    },
                    value: {
                        color: "#cccc44",
                        font: "arial",
                        fontSize: 10
                    },
                    lines: {
                        enabled: false,
                        style: "curved",
                        color: "segment" // "segment" or a hex color
                    }
                },
                data: {
                    content: [
                        { label: "QB", value: piestuff[i][0], color: "#1f77b4" },
                        { label: "RB", value: piestuff[i][1], color: "#d62728" },
                        { label: "WR", value: piestuff[i][2], color: "#ff7f0e"},
                        { label: "TE", value: piestuff[i][3], color: "#2ca02c"}
                        ]
                },
                misc: {
                    canvasPadding: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    },
                    pieCenterOffset: {
                        x: -7,
                        y: -8
                    }
                }
            });
        }
    }

        
    console.log(svg.select("#mainpie"))

    var path = svg.selectAll('path')
        .append("g")
      .data(pie(totals))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', function(d, i) { 
        return piecolor(i);
      });
      
    path.attr("translate","transform (-20,10)")


    svg.append( "g" )
        .attr( "class", "x axis" )
        .attr( "transform", "translate(0," + height + ")" )
        .call( xAxis );

//  *****************************************************
//  MAKEA A PIECHART
// ******************************************************
//         piegroup = svg.append("g").attr("class","piecharts")
//                     .attr('transform', 'translate(' + (40 / 2) + 
//             ',' + (20 / 2) + ')');
    


//     var dropDown = d3.select( "#histogram" )
//         .append( "select" )
//         .attr( "name", "years" );
//
//     var options = dropDown.selectAll( "option" )
//         .data( years )
//         .enter()
//         .append( "option" );
//
//     options.text( function ( d, i )
//     {
//         return d;
//     } )
//         .attr( "value", function ( d, i )
//         {
//             return d;
//         } )
//
//     dropDown.on( "change", menuChanged );

//     function menuChanged()
//     {
// //             console.log(d3.event.target.value)
//         var selection = d3.event.target.value;
//         for ( var i = 0; i < years.length; i++ )
//         {
//             if( selection == years[ i ] )
//             {
//                 console.log( yearlist[ i ] )
//                 var binList = CalcBins( yearlist[ i ], numbins )
//                 y.domain( [ 0, d3.max( binList, function ( d )
//                 {
//                     return d;
//                 } ) ] )
//
//                 var updatebar = d3.select( "#histogram" ).selectAll( "g.bar" )
//                     .data( binList );
//
//                 updatebar.attr( "transform", function ( d, i )
//                 {
//                     return "translate(" + x( i * binsize ) + "," + y( d ) + ")";
//                 } );
//
//                 updatebar.selectAll( "rect" )
//                     .attr( "width", x( binsize ) - 1 )
//                     .attr( "height", function ( d )
//                     {
//                         return height - y( d );
//                     } )
//
//                 updatebar.selectAll( "text" )
//                     .text( function ( d )
//                     {
//                         return formatCount( d );
//                     } );
//
//             }
//         }
//     }
}
//         This will calculate num elements in each bin
function CalcBins( datalist, binnum, binsize )
{
    var bin_list = Array.apply( null, Array( binnum + 1 ) ).map( Number.prototype.valueOf, 0 )
    var bin_num
    for ( var i = 0; i < datalist.length; i++ )
    {
        bin_num = Math.floor( datalist[ i ] / binsize )
        if( bin_num < 1 )
        {
            bin_num = 0;
        }
        bin_list[ bin_num ] += 1
    }
//     console.log( bin_list )
    return bin_list
}

function CalcPlayerBins( datalist, binnum, binsize )
{
    var bin_list = [] 
    for (var i =0; i < binnum + 1; i++){
        bin_list.push([])
    }
    for ( var i = 0; i < datalist.length; i++ )
    {
        bin_num = Math.floor( datalist[ i ][0] / binsize )
        if( bin_num < 1 )
        {
            bin_num = 0;
        }
        bin_list[ bin_num ].push(datalist[i])
    }
    return bin_list
}

