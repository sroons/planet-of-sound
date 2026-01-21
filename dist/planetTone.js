var ToneInterface = /** @class */ (function () {
    function ToneInterface() {
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
    ToneInterface.prototype.makeString = function (horizOrVert) {
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
        }
        else {
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
    };
    ToneInterface.prototype.makeStringPanner = function (pan) {
        var panner = new Tone.PanVol(pan);
        panner.connect(this.reverb);
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
