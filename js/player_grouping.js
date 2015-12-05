//Setup the input field after the page is loaded
$( document ).ready( function ()
{

    //Get a reference to the added players div
    var addedPlayersDiv = $("#autocomplete_results_div" );

    //Default hide the added players div
    addedPlayersDiv.hide();

    //Setup click of delete player to remove the player row from the div. Also calls onclick of row to remove from array
    addedPlayersDiv.on( 'click', '#deletePlayerRow', function ()
    {
        //Remove from the div
        $( this ).parent().remove();
    } );

    //Setup the AutoComplete functionality for searching for players.
    $( '#add_player_input_field' ).autocomplete( {
        dataType: 'json',
        serviceUrl: 'http://localhost:8000/careers/',
        paramName: "starts_with",
        deferRequestBy: 100,
        transformResult: function ( response )
        {
            return {
                suggestions: $.map( response[ 'results' ], function ( dataItem )
                {
                    return { value: dataItem.player_name, data: dataItem };
                } )
            };
        },
        onSelect: function ( data )
        {
            //Clear out the input text field
            $( '#add_player_input_field' ).val( '' );

            //Stringify the current player for comparison in the isPlayerInFilteredSetFunction
            var stringifiedPlayer = JSON.stringify( data.data );

            //Only add if not already added to the array
            if( !isPlayerInFilterSet( stringifiedPlayer ) )
            {
                //Make sure the div showing added players is showing
                $( "#autocomplete_results_div" ).show();

                //Add the selected player to the additional player div
                $( '#autocomplete_group' ).append( '<div class="autocomplete-suggestion"><input type="image" src="images/delete_icon_2.png" width="16" height="16" style="vertical-align: middle; margin-right: 8px;" onclick=deletePlayerObject("' + data.data['pguid'] + '"); id="deletePlayerRow"></input>' + data.value + '</div>' );

                //Add player to selected player global array
                selectedPlayers.push( data.data );
            }
            else
            {
                alert( data.value + ' is already in the data set' );
            }
        }
    } );
} );

/**
 * Remove the player with the pguid of the provided player from the players list.
 * @param player
 */
function deletePlayerObject(playerGuidToDelete)
{
    $.each( selectedPlayers, function ( index, player )
    {
        //If they have the same pguid, they are the same person. Delete from array and stop execution. There should never be duplicates.
        if( playerGuidToDelete === player['pguid'] )
        {
            selectedPlayers.splice( index, 1 );
            return false;
        }
    } );

    //If there are no more additional players, hide the div.
    if( selectedPlayers.length == 0)
    {
        $("#autocomplete_results_div" ).hide();
    }
}