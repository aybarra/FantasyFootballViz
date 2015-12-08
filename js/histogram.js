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

    var numbins = 10
    var binning = [ 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000 ]
    var binsize = 500

// Generate a Bates distribution of 10 random variables.
    var careerlist = []
    var tot_players = 0
    var tot_points = 0
    var avg_player
    var std_dev
    var yeartuples = []

    hgram_careers.forEach( function ( d, i )
    {
        if( d.ff_pts != 0 )
        {
            careerlist.push( d.ff_pts )
            tot_players += 1
            tot_points += d.ff_pts
        }
    } );

    hgram_season_subset_data.forEach( function ( d )
    {
        if( d.year != 2015 )
        {
            d.guid = d.season_guid.split( "_" )[ 0 ]
            if( d.guid.indexOf( '.' ) != -1 )
            {
                d.guid = d.guid.replace( '.', '' );
            }
            d.year = +d.season_guid.split( "_" )[ 1 ]
            yeartuples.push( [ d.year, d.season_ff_pts ] );
        }
    } );

    yeartuples.sort( function ( a, b )
    {
        a = a[ 0 ];
        b = b[ 0 ];
        return a < b ? -1 : (a > b ? 1 : 0);
    } );
    var curyear = 0
    var years = []
    var yearlist = []
    var templist = []
    for ( var i = 0; i < yeartuples.length; i++ )
    {
        if( curyear != yeartuples[ i ][ 0 ] )
        {
            curyear = yeartuples[ i ][ 0 ]
            years.push( curyear )
            if( templist.length > 0 )
            {
                yearlist.push( templist );
            }
            templist = []
        }
        else
        {
            templist.push( yeartuples[ i ][ 1 ] )
        }
    }
    yearlist.push( templist )

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
        .orient( "bottom" );

    var svg = d3.select( "#sm-sec-1" ).append( "svg" )
        .attr( "width", width + margin.left + margin.right )
        .attr( "height", height + margin.top + margin.bottom )
        .append( "g" )
        .attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );

        svg.append("text")
            .attr("id","histogramtitle")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2) - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Cumulative Points Distribution");

    var bar = svg.selectAll( ".bar" )
        .data( binList )
        .enter().append( "g" )
        .attr( "class", "bar" )
        .attr( "transform", function ( d, i )
        {
            return "translate(" + x( i * binsize ) + "," + y( d ) + ")";
        } );

    bar.append( "rect" )
        .attr( "x", 1 )
        .attr( "width", x( binsize ) - 1 )
        .attr( "height", function ( d )
        {
            return height - y( d );
        } )
        .attr( "stroke", "black" )
        .attr( "fill", "lightgray")
        .on("mouseover", function (d) {
            d3.select(this).style("stroke","red").style("stroke-width","3px")
            d3.select(this.nextSibling).attr("stroke","red")
        })
        .on("mouseout", function (d) {
            d3.select(this).style("stroke","black").style("stroke-width","1px")
        })


    bar.append( "text" )
        .attr( "dy", ".06em" )
        .attr( "y", -3 )
        .attr( "x", x( binsize ) / 2 )
        .attr( "text-anchor", "middle" )
        .style( "stroke", "black" )
        .text( function ( d )
        {
            return formatCount( d );
        } );

    svg.append( "g" )
        .attr( "class", "x axis" )
        .attr( "transform", "translate(0," + height + ")" )
        .call( xAxis );

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
