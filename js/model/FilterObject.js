var FilterObject = function ( minDate, maxDate, minPoints, maxPoints, positions, statuses )
{
    this.minDate = minDate;
    this.maxDate = maxDate;
    this.minPoints = minPoints;
    this.maxPoints = maxPoints;
    this.positions = positions;
    this.statuses = statuses;
    this.players = [];
};

FilterObject.prototype.toString = function ()
{
    var filterToString = "Dates: " + this.minDate + "-" + this.maxDate + " Points: " + this.minPoints + "-" + this.maxPoints + " Pos: " + this.positions + "-" + this.statuses;
    console.log( filterToString );
    return filterToString;
};

FilterObject.prototype.prettyPrint = function ()
{
    var stringVal = '';
    if( this.minDate !== null )
    {
        stringVal += 'Dates: ' + this.minDate + "-" + this.maxDate + " ";
    }

    if( this.minPoints !== null )
    {
        stringVal += 'Points: ' + this.minPoints + "-" + this.maxPoints + " ";
    }

    if( this.positions !== null && this.positions.length > 0 )
    {
        stringVal += 'Positions: ' + this.positions.join();
    }

    if( this.statuses !== null && this.statuses.length == 1 )
    {
        //Must only have 1
        if( this.statuses[ 0 ] == 2 ) //TODO convert 2 to a constant
        {
            stringVal += "Statuses: Active";
        }
        else
        {
            stringVal += "Statuses: Inactive";
        }
    }
    else
    {
        stringVal += "Statuses: All";
    }
    return stringVal;

};

FilterObject.prototype.generateCareerUrl = function ()
{
    //Base URL
    var url = 'http://localhost:8000/careers/?';

    //Boolean to check and see if we should use ? or & to add new params
    var addAmp = '';

    if( this.minDate !== null )
    {
        url += "start_year=" + this.minDate + "&start_year_end=" + this.maxDate;
        addAmp = '&';
    }

    if( this.minPoints !== null )
    {
        url += addAmp + 'min_pts=' + this.minPoints + '&max_pts=' + this.maxPoints;
        addAmp = '&';
    }

    if( this.positions !== null && this.positions.length > 0 )
    {
        url += addAmp + 'pos=' + this.positions.join( '&pos=' );
        addAmp = '&';
    }

    //Only need to add if we only have 1 value. If we have 2 Values then we dont want to pass a status because we would want all the players
    if( this.statuses !== null && this.statuses.length == 1 )
    {
        url += addAmp + 'active=' + this.statuses[ 0 ];
        addAmp = '&';
    }

    return url;
};