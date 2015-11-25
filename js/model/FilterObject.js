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
}
