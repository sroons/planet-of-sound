var ToneInterface = /** @class */ (function () {
    function ToneInterface() {
        this.masterVolume = new Tone.Volume(-20).toMaster();
        this.synths = new Object();
        this.synths.H = new Tone.DuoSynth({
            vibratoAmount: 0.5,
            vibratoRate: 5,
            harmonicity: 1.5,
            voice0: {
                volume: 0,
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
                volume: 0,
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
                volume: 0,
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
                volume: 0,
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
        var panner = new Tone.PanVol(pan);
        panner.connect(this.masterVolume);
        return panner;
    };
    ToneInterface.prototype.setVolume = function (db) {
        this.masterVolume.volume.value = db;
    };
    ToneInterface.prototype.setMute = function (muted) {
        this.masterVolume.mute = muted;
    };
    ToneInterface.prototype.playString = function (line, pitch, volume, planetMass, pan) {
        var string = line.string;
        var panner = line.panner;
        panner.volume.value = volume;
        if (pan != null)
            panner.pan.value = pan;
        string.connect(panner);
        string.triggerAttackRelease(pitch, 0.1);
    };
    return ToneInterface;
}());
