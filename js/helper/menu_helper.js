//Setup the input field after the page is loaded
$( document ).ready( function ()
{
    //Variable to hold the state of the sliding menu
    var isMenuOpen = false;

    //Initialize the sliding drawer for the filters.
    $( "#menu-trigger" ).click( function ()
    {
        //If open -- close, if closed -- open
        if( isMenuOpen )
        {
            $( "#menu" ).css( {
                "display": "none"
            } );
        }
        else
        {
            $( "#menu" ).css( {
                "display": "block"
            } );
        }
        isMenuOpen = !isMenuOpen;
    } );
} );