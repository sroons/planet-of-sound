//###############################################
class GridLine {
    x: number;
    y: number;
    width: number;
    height: number;
    path: Path.Line;
    midiNote: string;
    plucked: boolean;
    color: string;
    type: string;

    constructor(x: number, y: number, width: number, height: number, midiNote: string, type:string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.midiNote = midiNote;
        this.color = "#666";
        this.plucked = false;
        this.type = type;
    }

    setPlucked(plucked: boolean) {
        this.plucked = plucked;
    }
}