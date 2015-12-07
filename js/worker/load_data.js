/**
 * Call to make all the web requests to the server to get all the data for the pages.
 */
function loadPageData()
{
    $.ajax( {
        url: defaultFilterObject.generateCareerUrl(),
        type: 'GET',
        async: false,
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

    $.ajax( {
        url: 'http://localhost:8000/seasons_subset/?players=' + filteredPlayersPguids().join(),
        type: 'GET',
        async: false,
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

    //postMessage(0);
}