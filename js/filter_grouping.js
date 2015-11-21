var yearsSelectionText = '';
var pointsSelectionText = '';
var positionsSelectionText = '';

function drawSelectionFilter()
{
    //Create the Year Filter Graph with Average Fantasy point values as Y values.
    var dateSelectionChart = dc.barChart( "#filter_years", "date_filter_group" );
    d3.csv( "data/player_filter_test_data.csv", function ( error, data )
    {
        //Format the Year AND convert the fantasy points values to numbers.
        data.forEach( function ( x )
        {
            x.year = yearFormat.parse( x.year );
            x.total_fantasy_points = +x.total_fantasy_points;
        } );

        //Create a multi-dimensional dataset for crossfilter use
        var groupingCrossFilter = crossfilter( data );

        //Get the min and max year for use as x-axis
        var maxYear = d3.max( data, function ( d )
        {
            return d.year;
        } );
        var minYear = d3.min( data, function ( d )
        {
            return d.year;
        } );

        //Create a dimension (Y) for points
        var pointsDimension = groupingCrossFilter.dimension( function ( d )
        {
            return d.year;
        } );

        //Create a grouping (X) for points
        var pointsGroup = pointsDimension.group().reduceSum( function ( d )
        {
            return +d.total_fantasy_points;
        } );

        //Add a callback for when the chart selection is changed
        dateSelectionChart.on( "filtered", onDateChartFiltered );

        //Generate the Chart
        dateSelectionChart.width( 500 )
            .height( 40 )
            .margins( { top: 0, right: 50, bottom: 20, left: 40 } )
            .dimension( pointsDimension )
            .group( pointsGroup )
            .centerBar( true )
            .x( d3.time.scale().domain( [ minYear, maxYear ] ) )
            .round( d3.time.year.round )
            .xUnits( d3.time.year )/*to get thicker lines function(){return 10;} but it throws off handles..*/
            .yAxis().ticks( 0 );

        //Only render charts in the current group.
        dc.renderAll( "date_filter_group" );
    } )

    //Create the Fantasy Point Range Chart with Y being # of players with that career fantasy points
    var fantasyPointSelectionChart = dc.barChart( "#filter_dates", "date_filter_group" );
    d3.csv( "data/fantasy_points_test_data.csv", function ( error, data )
    {
        //Format the data to numbers
        data.forEach( function ( x )
        {
            x.points = +x.points;
            x.num_player_with_points = +x.num_player_with_points;
        } );

        //Create a multi-dimensional dataset for crossfilter use
        var groupingCrossFilter = crossfilter( data );

        //Get the min and max year for use as x-axis
        var maxPoints = d3.max( data, function ( d )
        {
            return d.points;
        } );
        var minPoints = d3.min( data, function ( d )
        {
            return d.points;
        } );

        //Create a dimension (Y) for points
        var pointsDimension = groupingCrossFilter.dimension( function ( d )
        {
            return d.points;
        } );

        //Create a grouping (X) for points
        var countGroup = pointsDimension.group().reduceSum( function ( d )
        {
            return +d.num_player_with_points;
        } );

        //Add a callback for when the chart selection is changed
        fantasyPointSelectionChart.on( "filtered", onPointsChartFiltered );

        //Generate the Chart
        fantasyPointSelectionChart.width( 500 )
            .height( 40 )
            .margins( { top: 0, right: 50, bottom: 20, left: 40 } )
            .centerBar( true )
            .dimension( pointsDimension )
            .group( countGroup )
            .x( d3.scale.linear().domain( [ minPoints, maxPoints ] ) )
            .yAxis().ticks( 0 );

        //Only render charts in the current group.
        dc.renderAll( "date_filter_group" );
    } )

    $( "#filter_position" ).find( ":checkbox" ).change( function ()
    {
        onPositionToggled();
    } );

}

/**
 * Called when the Date chart is filtered
 * @param chart
 */
function onDateChartFiltered( chart )
{
    //Get a reference to the div where we want the values to go.
    var infoDiv = $( "#filter_info_div" );
    yearsSelectionText = '';

    //Get the current brush values
    var dateArray = chart.brush().extent();

    //If invalid data, clear out div and return.
    if( dateArray == null || dateArray.length != 2 )
    {
        infoDiv.empty();
        return;
    }

    //Get the year values
    var lowerDate = dateArray[ 0 ].getFullYear();
    var upperDate = dateArray[ 1 ].getFullYear();

    //if the values are the same, clear them out and return
    if( lowerDate === upperDate )
    {
        infoDiv.empty();
        return;
    }

    //Print the year values
    yearsSelectionText = "<b>Years:</b> " + lowerDate + " - " + upperDate;
    drawFilterStatus();
}

/**
 * Called when the points chart is filtered.
 * @param chart
 */
function onPointsChartFiltered( chart )
{
    //Get a reference to the div where we want the values to go.
    var infoDiv = $( "#filter_info_div" );
    pointsSelectionText = '';

    var pointsArray = chart.brush().extent();

    if( pointsArray == null || pointsArray.length != 2 )
    {
        infoDiv.empty();
        return;
    }

    //Get the year values
    var lowerPoints = Math.round( pointsArray[ 0 ] );
    var upperPoints = Math.round( pointsArray[ 1 ] );

    //if the values are the same, clear them out and return
    if( lowerPoints === upperPoints )
    {
        infoDiv.empty();
        return;
    }

    //Print the points values
    pointsSelectionText = "<b>Points:</b> " + lowerPoints + " - " + upperPoints;
    drawFilterStatus();
}

/**
 * Called when any player position check box is toggled
 */
function onPositionToggled()
{
    positionsSelectionText = '<b>Positions:</b> ';

    //Check if any are checked
    if( $( "#filter_position" ).find( ":checkbox:checked" ).length <= 0 )
    {
        positionsSelectionText = '';
    }
    else
    {
        //Something was Checked, append text values to string
        if( $( "#filter_running_back" ).is( ":checked" ) )
        {
            positionsSelectionText += " RB ";
        }
        if( $( "#filter_quarter_back" ).is( ":checked" ) )
        {
            positionsSelectionText += " QB ";
        }

        if( $( "#filter_wr_te" ).is( ":checked" ) )
        {
            positionsSelectionText += " WR/TE ";
        }
    }

    //Redraw all filter text
    drawFilterStatus();
}

/**
 * Draw the currently selected filters below the filter selection.
 * Allows user to see what they have selected.
 */
function drawFilterStatus()
{
    var infoDiv = $( "#filter_info_div" );
    infoDiv.empty();
    $( "<p>" + yearsSelectionText + " " + pointsSelectionText + " " + positionsSelectionText + "</p>" ).appendTo( infoDiv );
}

/**
 * Clear all of the filters off of the current grouping of filter charts. Also clear out check boxes.
 */
function clearAll()
{
    dc.filterAll( "date_filter_group" );
    dc.redrawAll( "date_filter_group" );
    $( "#filter_position" ).find( ":checkbox" ).attr( "checked", false );
}