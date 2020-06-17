//control the tone.js library
interface ToneNote {
    pitch: string;
    velocity: number;
    duration: number;
    pan: number;
    synths: object;
}

class ToneInterface {
    note: ToneNote;
    synths: object;
    panner: Tone.PanVol;

    constructor() {
        this.synths = new Object();
        this.synths.H = new Tone.PluckSynth({
            resonance: 0.9,
            dampening:2000,
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.2,
                release: 0.7,
            }
        }).toMaster();
        this.synths.V = new Tone.PluckSynth({
            envelope: {
                attack: 0.01,
                decay: 0.4,
                sustain: 0.2,
                release:0.5
            },
            
        }).toMaster();
        this.panner = new Tone.PanVol();
        this.synths.H.connect(this.panner);
        this.synths.V.connect(this.panner);
        
    }

    playNote(pitch: string, velocity: number, duration: number, pan: number, horizOrVert: string) {
        this.panner.volume = velocity;
        this.panner.pan = pan;
        this.synths[horizOrVert].triggerAttackRelease(pitch, "32n");
    }

    makeString(pan: number, horizOrVert: string) {
        var synth = this.synths[horizOrVert];
        var panner = new Tone.PanVol(pan)
        var newSynth = Object.assign(Object.create(Object.getPrototypeOf(synth)), synth);
        newSynth.connect(panner);
        return newSynth;
    }

    playString(string: Tone.PluckSynth, pitch: number) {
        string.triggerAttackRelease(pitch, "32n");
    }

    setStringPan(string: Tone.synth, pan: number) {

    }
}