/**
 * Returns true if player currently in filter set. False if the player is not found.
 * This functions needs a stringified version of a players careers JSON to perform properly.
 */
function isPlayerInFilterSet( stringifiedPlayer )
{
    //Boolean value for isPlayerFound in the current set of players
    var isPlayerFound = false;

    //Get all of the currently filtered down players.
    var jsonFilteredPlayers = filteredPlayers();

    //Loop through all of the players to see if the one we are passing in is already contained in the set.
    $.each( jsonFilteredPlayers, function ( index, jsonFilteredPlayer )
    {
        //Stringify the player json for comparison
        var stringifiedJsonPlayer = JSON.stringify(jsonFilteredPlayer);

        //If the player matches, set the return value and break out of the for loop.
        if( stringifiedPlayer === stringifiedJsonPlayer)
        {
            isPlayerFound = true;
            return false; //return false breaks out of the each loop.
        }
    } );

    return isPlayerFound;
}

/**
 * Returns an array with all of the unique player guids that are currently selected from the filtered objects.
 */
function filteredPlayersPguids()
{
    //Create the return array
    var filteredPlayersPguids = [];

    //Get the list of currently filtered players JSONS
    var players = filteredPlayers();

    $.each( players, function ( index, player )
    {
        filteredPlayersPguids.push( player['pguid'] );
    } );
    return filteredPlayersPguids;
}

/**
 * Returns an array with all of the unique players that are currently selected from the filtered objects.
 * The JSON objects are the JSON response from a players careers route.
 */
function filteredPlayers()
{
    //Create the set to place the pks
    var playerSet = new Set();

    //Loop through all of the filter objects
    $.each( filterObjects, function ( index, filterObject )
    {
        //Get the filter objects players array
        var players = filterObject.players;

        //Loop through all of the player pks and add to set.
        $.each( players, function ( index2, player )
        {
            //Use the stringify function so that the === function passes for the json objects.
            playerSet.add( JSON.stringify( player ) );
        } );
    } );

    //Loop through all of the extra searched players and add to the set
    $.each( selectedPlayers, function ( index, player )
    {
        //Use the stringify function so that the === function passes for the json objects.
        playerSet.add( JSON.stringify( player ) );

    } );

    //Loop through the array and convert the string into JSON objects. Needed to be strings for comparison
    var playerArray = Array.from( playerSet );
    $.each( playerArray, function ( index, playerString )
    {
        playerArray[ index ] = JSON.parse( playerString );
    } );

    //return an array containing all of the unigue players
    return playerArray;
}