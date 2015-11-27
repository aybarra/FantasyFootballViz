var FilterObject = function ( minDate, maxDate, minPoints, maxPoints, positions )
{
    this.minDate = minDate;
    this.maxDate = maxDate;
    this.minPoints = minPoints;
    this.maxPoints = maxPoints;
    this.positions = positions;
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
