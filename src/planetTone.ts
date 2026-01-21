//control the tone.js library
declare var Tone: any;

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
    reverb: Tone.JCReverb;
    masterVolume: Tone.Volume;

    constructor() {
        this.masterVolume = new Tone.Volume(-10).toMaster();
        this.reverb = new Tone.JCReverb({
            roomSize: 0.9
        });
        this.reverb.wet.value = 0.3;
        this.reverb.connect(this.masterVolume);
        this.synths = new Object();
        // Horizontal lines - metallic triangle sound
        this.synths.H = new Tone.FMSynth({
            harmonicity: 5.5,
            modulationIndex: 20,
            oscillator: { type: "triangle" },
            envelope: {
                attack: 0.001,
                decay: 1.5,
                sustain: 0,
                release: 0.5
            },
            modulation: { type: "square" },
            modulationEnvelope: {
                attack: 0.001,
                decay: 0.5,
                sustain: 0,
                release: 0.3
            }
        });
        // Vertical lines - vibraphone-like mallet sound
        this.synths.V = new Tone.FMSynth({
            harmonicity: 12,
            modulationIndex: 3,
            oscillator: { type: "sine" },
            envelope: {
                attack: 0.001,
                decay: 0.3,
                sustain: 0,
                release: 0.15
            },
            modulation: { type: "triangle" },
            modulationEnvelope: {
                attack: 0.001,
                decay: 0.15,
                sustain: 0,
                release: 0.1
            }
        });
    }

    makeString(horizOrVert: string) {
        if (horizOrVert === "H") {
            // Metallic triangle sound
            return new Tone.FMSynth({
                harmonicity: 5.5,
                modulationIndex: 20,
                oscillator: { type: "triangle" },
                envelope: { attack: 0.001, decay: 1.5, sustain: 0, release: 0.5 },
                modulation: { type: "square" },
                modulationEnvelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.3 }
            });
        } else {
            // Vibraphone-like mallet sound
            return new Tone.FMSynth({
                harmonicity: 12,
                modulationIndex: 3,
                oscillator: { type: "sine" },
                envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.15 },
                modulation: { type: "triangle" },
                modulationEnvelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 }
            });
        }
    }

    makeStringPanner(pan) {
        var panner = new Tone.PanVol(pan);
        panner.connect(this.reverb);
        return panner;
    }

    setVolume(db: number) {
        this.masterVolume.volume.value = db;
    }

    setMute(muted: boolean) {
        this.masterVolume.mute = muted;
    }

    playString(line: object, pitch: number, volume: number, planetMass:number, pan:number) {
        var string = line.string;
        var panner = line.panner;
        panner.volume.value = volume;
        if (pan != null) panner.pan.value = pan;
        string.connect(panner);
        string.triggerAttackRelease(pitch, 0.1);
    }
}