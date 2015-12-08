//Setup default ajax request details. All ajax requests will have the attributes unless changed.
$.ajaxSetup( {
    type: 'GET',
    data: {
        format: 'json'
    }
} );

/**
 * Call to get the career data.
 * @returns {*}
 */
function getCareerDataWebRequest()
{
    return $.ajax( {
        url: defaultFilterObject.generateCareerUrl(),
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

/**
 * Call to return an array of ajax requests for seasons and season subsets
 * @returns {Array}
 */
function getSeasonAndSeasonSubsetWebRequests()
{
    var ajaxRequests = [], payloadSize = 100;
    var players = filteredPlayersPguids();

    season_subset_data = [];
    season_data = [];

    //Should always have something.
    while ( players.length > 0 )
    {
        ajaxRequests.push( $.ajax( {
                url: 'http://localhost:8000/seasons_subset/?players=' + players.splice( 0, payloadSize ).join(),
                error: function ()
                {
                    alert( "ERROR MAKING WEB REQUEST FOR PLAYER KEYS" )
                }
                ,
                success: function ( data )
                {
                    //Get the result array
                    $.merge( season_subset_data, data[ 'results' ] );
                }
            }
        ) );
    }

    players = filteredPlayersPguids();
    //Should always have something.
    while ( players.length > 0 )
    {
        ajaxRequests.push( $.ajax( {
                url: 'http://localhost:8000/seasons/?players=' + players.splice( 0, payloadSize ).join(),
                error: function ()
                {
                    alert( "ERROR MAKING WEB REQUEST FOR PLAYER KEYS" )
                },
                success: function ( data )
                {
                    //Get the result array
                    $.merge( season_data, data[ 'results' ] );
                }
            }
        ) );
    }

    return ajaxRequests;
}

/**
 * Call to return an array of ajax requests for seasons and season subsets for a SINGLE PLAYER
 * @returns {Array}
 */
function getSingularPlayerSeasonAndSeasonSubsetWebRequests( pguid )
{
    var ajaxRequests = [];
    ajaxRequests.push( $.ajax( {
            url: 'http://localhost:8000/seasons_subset/?players=' + pguid,
            error: function ()
            {
                alert( "ERROR MAKING WEB REQUEST FOR PLAYER KEYS" )
            }
            ,
            success: function ( data )
            {
                //Get the result array
                season_subset_data.push( data[ 'results' ][ 0 ] );
            }
        }
    ) );

    ajaxRequests.push( $.ajax( {
            url: 'http://localhost:8000/seasons/?players=' + pguid,
            error: function ()
            {
                alert( "ERROR MAKING WEB REQUEST FOR PLAYER KEYS" )
            },
            success: function ( data )
            {
                //Get the result array
                season_data.push( data[ 'results' ][ 0 ] );
            }
        }
    ) );

    return ajaxRequests;
}

/**
 * Called after all data is retrieved for the initial page load.
 */
function finalize_load()
{
    $.when.apply( null, getSeasonAndSeasonSubsetWebRequests() ).done( function ()
    {
        loadScatterPlot( filteredPlayers() ); //Loads from filters
        generateCDF_D3Chart( season_subset_data );
        generateHistogram( filteredPlayers(), season_subset_data );
        createTable(); //Not a chart
//     drawPCChart( filteredPlayers(), season_data );
        generateLineChart( season_subset_data );
        generateHistoryLine( season_subset_data );
        hideLoading();
    } );
}

/**
 * Called after all data is retrieved for an update.
 */
function finalize_update()
{
    $.when.apply( null, getSeasonAndSeasonSubsetWebRequests() ).done( function ()
    {
        redrawAllCharts();
    } );
}

/**
 * Actually redraws the charts.
 */
function redrawAllCharts()
{
    updateCDFData( season_subset_data );
    loadScatterPlot( filteredPlayers() );
    updateSeasonalData( season_subset_data );
    hideLoading();
}

/**
 * Call this to perform the initial page load
 */
function loadPageWithAllChartData()
{
    showLoading();
    getCareerDataWebRequest().then( finalize_load );
}

function loadPlayerDataAndRefresh( pguid )
{
    showLoading();
    $.when.apply( null, getSingularPlayerSeasonAndSeasonSubsetWebRequests( pguid ) ).done( function ()
    {
        redrawAllCharts();
    } );

}

/**
 * Call this when any filters are added or removed and we need to update the charts.
 */
function reloadAllChartData()
{
    showLoading();
    finalize_update();
    //getCareerDataWebRequest().then( finalize_update );
}