//###############################################
var GridLine = /** @class */ (function () {
    function GridLine(x, y, width, height, midiNote, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.midiNote = midiNote;
        this.color = "#666";
        this.plucked = false;
        this.type = type;
    }
    GridLine.prototype.setPlucked = function (plucked) {
        this.plucked = plucked;
    };
    return GridLine;
}());
