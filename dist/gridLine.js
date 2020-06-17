//###############################################
var GridLine = /** @class */ (function () {
    function GridLine(x, y, width, height, midiNote, webAudioNote, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.midiNote = midiNote;
        this.webAudioNote = webAudioNote;
        this.color = type == "horizontal" ? "#666" : "#bbb";
        this.plucked = false;
        this.type = type;
    }
    GridLine.prototype.setPlucked = function (plucked) {
        this.plucked = plucked;
    };
    return GridLine;
}());
