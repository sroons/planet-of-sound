var ToneInterface = /** @class */ (function () {
    function ToneInterface() {
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
    ToneInterface.prototype.makeString = function (horizOrVert) {
        var synth = this.synths[horizOrVert];
        var newSynth = Object.assign(Object.create(Object.getPrototypeOf(synth)), synth);
        return newSynth;
    };
    ToneInterface.prototype.makeStringPanner = function (pan) {
        return new Tone.PanVol(pan);
    };
    ToneInterface.prototype.playString = function (line, pitch, volume, planetMass, pan) {
        var string = line.string;
        var panner = line.panner;
        panner.volume = volume;
        if (pan != null)
            panner.pan = pan;
        string.connect(panner).toMaster();
        string.triggerAttackRelease(pitch, 0.1);
    };
    return ToneInterface;
}());
