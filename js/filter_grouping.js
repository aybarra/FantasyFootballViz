var yearsSelectionText = '';
var pointsSelectionText = '';
var positionsSelectionText = '';
var statusSelectionText = '';
var DATE_FILTER_CHARTS_GROUP = "date_filter_group";
var POINTS_FILTER_CHARTS_GROUP = "points_filter_group";

//Selected Values
var minDate = null;
var maxDate = null;
var minPoints = null;
var maxPoints = null;
var positions = null;
var statuses = null;

//Constants
var minFilterObjectCount = 1;

//charts
var dateSelectionChart = null;
var fantasyPointSelectionChart = null;

function drawSelectionFilter()
{
    //Draw the two main charts
    drawFilterYearsChart();
    drawFilterPointsChart();

    //Setup the filter positions onChange Listener
    $( "#filter_position" ).find( ":checkbox" ).change( function ()
    {
        onPositionToggled();
    } );

    //Setup the filter player status onChange Listener
    $( "#filter_active_inactive" ).find( ":checkbox" ).change( function ()
    {
        onPlayerStatusToggled();
    } );

    //Get a reference to the menu trigger
    var menuTrigger = $( "#menu-trigger" );

    //Setup apply filter onclick button
    $( "#add_filter_button" ).click( function ()
    {
        //If all variables are null, just close the drawer
        if( minDate === null && maxDate === null && minPoints === null && maxPoints === null && positions === null && statuses === null )
        {
            //Clear out all of the local variables and charts
            clearVariables();

            //Close the drawer
            menuTrigger.trigger( "click" );
            return;
        }

        //Push a new filter object onto the array of filter objects
        var filterObject = new FilterObject( minDate, maxDate, minPoints, maxPoints, positions, statuses );
        filterObjects.push( filterObject );

        //Make a webcall to get entities based on the filter values
        $.ajax( {
            url: filterObject.generateCareerUrl(),
            type: 'GET',
            data: {
                format: 'json'
            },
            error: function ()
            {
                alert( "ERROR MAKING WEB REQUEST FOR PLAYER KEYS" )
            },
            success: function ( data )
            {
                //Get the result array
                data = data[ 'results' ];

                //Loop through the array and get all of the player pks
                $.each( data, function ( index, player )
                {
                    //Add each of the new players to the pguid map for caching reference.
                    addPlayerToPguidMap( player );

                    filterObject.players.push( player );
                } );

                //Redraw the filter items table.
                drawCurrentFilterTable();

                //Clear out all of the local variables and charts
                clearVariables();

                //Call the sliding drawer click function to close the drawer
                menuTrigger.trigger( "click" );

                //reload all of the chart data
                reloadAllChartData();

            }
        } );

    } );

    //Setup cancel filter onclick button
    $( "#clear_filter_button" ).click( function ()
    {
        //Clear out all of the local variables and charts
        clearVariables();

        //Close the drawer
        menuTrigger.trigger( "click" );
    } );
}

/**
 * Called when the Date chart is filtered
 * @param chart
 */
function onDateChartFiltered( chart )
{
    //Clear out global variables
    minDate = null;
    maxDate = null;

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

    //Set the global variables
    minDate = lowerDate;
    maxDate = upperDate;

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
    //Clear out global variables
    minPoints = null;
    maxPoints = null;

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

    //Set the global variables
    minPoints = lowerPoints;
    maxPoints = upperPoints;

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

    //Clear out the positions array
    positions = [];

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
            positions.push( "rb" );
            positionsSelectionText += " RB ";
        }
        if( $( "#filter_quarter_back" ).is( ":checked" ) )
        {
            positions.push( "qb" );
            positionsSelectionText += " QB ";
        }

        if( $( "#filter_wr" ).is( ":checked" ) )
        {
            positions.push( "wr" );
            positionsSelectionText += " WR ";
        }

        if( $( "#filter_te" ).is( ":checked" ) )
        {
            positions.push( "te" );
            positionsSelectionText += " TE ";
        }
    }

    //Redraw all filter text
    drawFilterStatus();
}

/**
 * Called when any player status check box is toggled
 */
function onPlayerStatusToggled()
{
    statusSelectionText = '<b>Statuses:</b> ';

    //Clear out the statuses array
    statuses = [];

    //Check if any are checked
    if( $( "#filter_active_inactive" ).find( ":checkbox:checked" ).length <= 0 )
    {
        statusSelectionText = '';
    }
    else
    {
        //Something was Checked, append text values to string
        if( $( "#filter_active" ).is( ":checked" ) )
        {
            statuses.push( "2" );
            statusSelectionText += " Active ";
        }
        if( $( "#filter_inactive" ).is( ":checked" ) )
        {
            statuses.push( "3" );
            statusSelectionText += " Inactive ";
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
    $( "<p>" + yearsSelectionText + " " + pointsSelectionText + " " + positionsSelectionText + " " + statusSelectionText + "</p>" ).appendTo( infoDiv );
}

function clearVariables()
{
    //Clear out charts.
    dc.filterAll( DATE_FILTER_CHARTS_GROUP );
    dc.redrawAll( DATE_FILTER_CHARTS_GROUP );

    dc.filterAll( POINTS_FILTER_CHARTS_GROUP );
    dc.redrawAll( POINTS_FILTER_CHARTS_GROUP );

    $( "#filter_position" ).find( ":checkbox" ).attr( "checked", false );
    $( "#filter_active_inactive" ).find( ":checkbox" ).attr( "checked", false );

    //Selection variables
    minDate = null;
    maxDate = null;
    minPoints = null;
    maxPoints = null;
    positions = null;
    statuses = null;

    //Printing variables
    yearsSelectionText = "";
    pointsSelectionText = "";
    positionsSelectionText = "";
    statusSelectionText = "";

    //Clear out div
    drawFilterStatus();

}

/**
 * Draw the Filter Years Chart. Uses an Ajax call to get the data.
 */
function drawFilterYearsChart()
{
    //Create the Year Filter Graph with Average Fantasy point values as Y values.
    dateSelectionChart = dc.barChart( "#filter_years", DATE_FILTER_CHARTS_GROUP );
    d3.csv( "data/year_data.csv", function ( error, data )
    {
        //Format the Year AND convert the fantasy points values to numbers.
        data.forEach( function ( x )
        {
            x.year = yearFormat.parse( x.year + "" );
            x.ff_pt_average = +x.ff_pt_average;
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
            return +d.ff_pt_average;
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
        dc.renderAll( DATE_FILTER_CHARTS_GROUP );
    } );
}

/**
 * Draw the filter points chart. Info if retrieved from the CSV file.
 */
function drawFilterPointsChart()
{
    //Create the Fantasy Point Range Chart with Y being # of players with that career fantasy points
    fantasyPointSelectionChart = dc.barChart( "#filter_dates", POINTS_FILTER_CHARTS_GROUP );
    d3.csv( "data/fantasy_points_test_data2.csv", function ( error, data )
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
        dc.renderAll( POINTS_FILTER_CHARTS_GROUP );
    } );
}

function drawCurrentFilterTable()
{
    //Get a reference to the table
    var table = $( "#filters_table" );

    //Clear out the current table
    table.empty();

    //Loop through and add all the current filters
    $.each( filterObjects, function ( index, filterObject )
    {
        //noinspection HtmlUnknownTarget
        table.append( '<tr valign="middle"><td><input type="image" src="images/delete_icon_2.png" width="16" height="16" id="filter_grouping" style="vertical-align: middle; margin-right: 10px;" onclick="deleteFilterObject(' + index + ');" id="deleteFilterRow"></input></td><td><p style="vertical-align: middle; margin-bottom: 0px;">' + filterObject.prettyPrint() + '</p></td></tr>' );
    } );

    //Add an onClick to remove the filter from the row
    table.on( 'click', '#deleteFilterRow', function ()
    {
        //Only allow delete of filter object if we have more than the minimum count. We dont want them to have no filters.
        //If you change this logic, change it in deleteFilterObject as well.
        if( filterObjects.length > minFilterObjectCount )
        {
            //Remove from the Table
            $( this ).parent().parent().remove();
        }
    } );
}

/**
 * Called by the X of each filter row from drawCurrentFilterTable. Removes the item from the array AND redraws the table so that the old row values are updated.
 * @param index
 */
function deleteFilterObject( index )
{
    //Only allow delete of filter object if we have more than the minimum count. We dont want them to have no filters.
    if( filterObjects.length > minFilterObjectCount )
    {
        //remove from array
        filterObjects.splice( index, 1 );

        //redraw the table to give new i values to rows
        drawCurrentFilterTable();

        //Reload all of the tables because a filter item was deleted.
        reloadAllChartData();
    }
    else
    {
        alert( 'Must Maintain ' + minFilterObjectCount + ' filter' );
    }
}