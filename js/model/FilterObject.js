var FilterObject = function ( minDate, maxDate, minPoints, maxPoints, positions )
{
    this.minDate = minDate;
    this.maxDate = maxDate;
    this.minPoints = minPoints;
    this.maxPoints = maxPoints;
    this.positions = positions;
    this.players = [];
};

FilterObject.prototype.toString = function ()
{
    var filterToString = "Dates: " + this.minDate + "-" + this.maxDate + " Points: " + this.minPoints + "-" + this.maxPoints + " Pos: " + this.positions;
    console.log( filterToString );
    return filterToString;
};

FilterObject.prototype.prettyPrint = function ()
{
    var stringVal = '';
    if( this.minDate !== null)
    {
        stringVal += 'Dates: ' + this.minDate + "-" + this.maxDate + " ";
    }

    if( this.minPoints !== null)
    {
        stringVal += 'Points: ' + this.minPoints + "-" + this.maxPoints + " ";
    }

    if( this.positions !== null && this.positions.length > 0)
    {
        stringVal += 'Positions: ' + this.positions.join();
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
        url += addAmp + 'pos=' + this.positions.join('&pos=');
        addAmp = '&';
    }

    return url;
};