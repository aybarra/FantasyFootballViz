function first()
{
    return $.ajax( {
        url: defaultFilterObject.generateCareerUrl(),
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
                addPlayerToPguidMap( player );
                defaultFilterObject.players.push( player );
            } );

        }
    } );
}

function second( data, textStatus, jqXHR )
{
    return $.ajax( {
        url: 'http://localhost:8000/seasons_subset/?players=' + filteredPlayersPguids().join(),
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
            season_subset_data = data[ 'results' ];
        }
    } );
}

function third( data, textStatus, jqXHR )
{
    return $.ajax( {
        url: 'http://localhost:8000/seasons/?players=' + filteredPlayersPguids().join(),
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
            season_data = data[ 'results' ];
        }
    } );
}

function fourth( data, textStatus, jqXHR )
{
    loadScatterPlot( filteredPlayers() ); //Loads from filters
    generateCDF_D3Chart( season_subset_data );
    generateHistogram( filteredPlayers(), season_subset_data );
    createTable(); //Not a chart
    drawPCChart( filteredPlayers(), season_data );
    generateLineChart( season_subset_data );
    generateHistoryLine( season_subset_data );
}

function fifth( data, textStatus, jqXHR )
{
    updateCDFData( season_subset_data );
    loadScatterPlot( filteredPlayers() );
}

function loadPageData()
{
    first().then( second ).then( third );
}

function loadPageWithAllChartData()
{
    first().then( second ).then( third ).then( fourth );
}

function reloadAllChartData()
{
    first().then( second ).then( third ).then( fifth );
}