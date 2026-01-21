//###############################################
class GridLine {
    x: number;
    y: number;
    width: number;
    height: number;
    path: Path.Line;
    midiNote: string;
    webAudioNote:string
    plucked: boolean;
    color: string;
    type: string;
    text: object;
    string: Tone.PluckSynth;

    constructor(x: number, y: number, width: number, height: number, midiNote: string, webAudioNote:string, type:string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.midiNote = midiNote;
        this.webAudioNote = webAudioNote;
        this.color = type == "horizontal" ? "#555" : "#666";
        this.plucked = false;
        this.type = type;
    }

    setPlucked(plucked: boolean) {
        this.plucked = plucked;
    }
}