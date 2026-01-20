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
    reverb: Tone.Reverb;
    masterVolume: Tone.Volume;

    constructor() {
        this.masterVolume = new Tone.Volume(-10).toMaster();
        this.synths = new Object();
        this.synths.H = new Tone.DuoSynth({
            vibratoAmount: 0.5,
            vibratoRate: 5,
            harmonicity: 1.5,
            voice0: {
                volume: -10,
                portamento: 0,
                oscillator: {
                    type: "sine"
                },
                filterEnvelope: {
                    attack: 0.01,
                    decay: 0,
                    sustain: 1,
                    release: 0.5
                },
                envelope: {
                    attack: 0.01,
                    decay: 0,
                    sustain: 1,
                    release: 0.5
                }
            },
            voice1: {
                volume: -10,
                portamento: 0,
                oscillator: {
                    type: "square4"
                },
                filterEnvelope: {
                    attack: 0.01,
                    decay: 0,
                    sustain: 1,
                    release: 0.5
                },
                envelope: {
                    attack: 0.01,
                    decay: 0,
                    sustain: 1,
                    release: 0.5
                }
            }
        });
        this.synths.V = new Tone.DuoSynth({
            vibratoAmount: 0.5,
            vibratoRate: 5,
            harmonicity: 3,
            voice0: {
                volume: -10,
                portamento: 0,
                oscillator: {
                    type: "sine4"
                },
                filterEnvelope: {
                    attack: 0.01,
                    decay: 0,
                    sustain: 1,
                    release: 0.5
                },
                envelope: {
                    attack: 0.01,
                    decay: 0,
                    sustain: 1,
                    release: 0.5
                }
            },
            voice1: {
                volume: -10,
                portamento: 0,
                oscillator: {
                    type: "square2"
                },
                filterEnvelope: {
                    attack: 0.01,
                    decay: 0,
                    sustain: 1,
                    release: 0.5
                },
                envelope: {
                    attack: 0.01,
                    decay: 0,
                    sustain: 1,
                    release: 0.5
                }
            }
        });
    }

    makeString(horizOrVert: string) {
        var synth = this.synths[horizOrVert];
        var newSynth = Object.assign(Object.create(Object.getPrototypeOf(synth)), synth);
        return newSynth;
    }

    makeStringPanner(pan) {
        var panner = new Tone.PanVol(pan);
        panner.connect(this.masterVolume);
        return panner;
    }

    setVolume(db: number) {
        this.masterVolume.volume.value = db;
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