//control the tone.js library
declare var Tone: any;

interface ToneNote {
    pitch: string;
    velocity: number;
    duration: number;
    pan: number;
    synths: object;
}

// Sound preset definitions
const soundPresets = {
    // Short attack/decay - percussive sounds
    "pluck": {
        type: "FM",
        harmonicity: 8,
        modulationIndex: 10,
        oscillator: { type: "triangle" },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 }
    },
    "click": {
        type: "FM",
        harmonicity: 1,
        modulationIndex: 50,
        oscillator: { type: "square" },
        envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.02 },
        modulation: { type: "sawtooth" },
        modulationEnvelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.01 }
    },
    "tick": {
        type: "FM",
        harmonicity: 14,
        modulationIndex: 2,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.03 },
        modulation: { type: "triangle" },
        modulationEnvelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.02 }
    },

    // Metallic sounds
    "bell": {
        type: "FM",
        harmonicity: 12,
        modulationIndex: 3,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 2.0, sustain: 0, release: 1.0 },
        modulation: { type: "triangle" },
        modulationEnvelope: { attack: 0.001, decay: 1.0, sustain: 0, release: 0.5 }
    },
    "chime": {
        type: "FM",
        harmonicity: 5.5,
        modulationIndex: 20,
        oscillator: { type: "triangle" },
        envelope: { attack: 0.001, decay: 1.5, sustain: 0, release: 0.5 },
        modulation: { type: "square" },
        modulationEnvelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.3 }
    },
    "gong": {
        type: "FM",
        harmonicity: 3.5,
        modulationIndex: 32,
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 4.0, sustain: 0.1, release: 2.0 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 0.01, decay: 2.0, sustain: 0.2, release: 1.0 }
    },
    "metallic": {
        type: "FM",
        harmonicity: 7,
        modulationIndex: 25,
        oscillator: { type: "square" },
        envelope: { attack: 0.001, decay: 0.8, sustain: 0, release: 0.4 },
        modulation: { type: "sawtooth" },
        modulationEnvelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.2 }
    },

    // Gritty/harsh sounds
    "buzz": {
        type: "FM",
        harmonicity: 1.5,
        modulationIndex: 40,
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.2 },
        modulation: { type: "square" },
        modulationEnvelope: { attack: 0.001, decay: 0.2, sustain: 0.1, release: 0.1 }
    },
    "growl": {
        type: "FM",
        harmonicity: 0.5,
        modulationIndex: 30,
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.02, decay: 0.5, sustain: 0.2, release: 0.3 },
        modulation: { type: "square" },
        modulationEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.2 }
    },
    "zap": {
        type: "FM",
        harmonicity: 2,
        modulationIndex: 80,
        oscillator: { type: "square" },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
        modulation: { type: "sawtooth" },
        modulationEnvelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.03 }
    },
    "crunch": {
        type: "FM",
        harmonicity: 1.2,
        modulationIndex: 60,
        oscillator: { type: "square" },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
        modulation: { type: "square" },
        modulationEnvelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.08 }
    },

    // Mellow/soft sounds
    "soft": {
        type: "FM",
        harmonicity: 2,
        modulationIndex: 1,
        oscillator: { type: "sine" },
        envelope: { attack: 0.05, decay: 0.8, sustain: 0.2, release: 0.5 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 0.05, decay: 0.5, sustain: 0.1, release: 0.3 }
    },
    "warm": {
        type: "FM",
        harmonicity: 3,
        modulationIndex: 2,
        oscillator: { type: "triangle" },
        envelope: { attack: 0.02, decay: 1.0, sustain: 0.1, release: 0.6 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 0.02, decay: 0.6, sustain: 0.05, release: 0.4 }
    },
    "pad": {
        type: "FM",
        harmonicity: 2,
        modulationIndex: 1.5,
        oscillator: { type: "sine" },
        envelope: { attack: 0.2, decay: 1.5, sustain: 0.4, release: 1.0 },
        modulation: { type: "triangle" },
        modulationEnvelope: { attack: 0.1, decay: 1.0, sustain: 0.2, release: 0.8 }
    },
    "flute": {
        type: "FM",
        harmonicity: 1,
        modulationIndex: 0.5,
        oscillator: { type: "sine" },
        envelope: { attack: 0.08, decay: 0.3, sustain: 0.6, release: 0.4 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.3 }
    },

    // Medium attack/decay - balanced sounds
    "vibes": {
        type: "FM",
        harmonicity: 12,
        modulationIndex: 3,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.6, sustain: 0, release: 0.3 },
        modulation: { type: "triangle" },
        modulationEnvelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.15 }
    },
    "marimba": {
        type: "FM",
        harmonicity: 4,
        modulationIndex: 4,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.2 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 }
    },
    "kalimba": {
        type: "FM",
        harmonicity: 6,
        modulationIndex: 5,
        oscillator: { type: "triangle" },
        envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.25 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.12 }
    },
    "glass": {
        type: "FM",
        harmonicity: 10,
        modulationIndex: 8,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 1.2, sustain: 0, release: 0.6 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 0.001, decay: 0.6, sustain: 0, release: 0.3 }
    },

    // Long sustain sounds
    "drone": {
        type: "FM",
        harmonicity: 1,
        modulationIndex: 2,
        oscillator: { type: "sine" },
        envelope: { attack: 0.3, decay: 0.5, sustain: 0.8, release: 1.5 },
        modulation: { type: "triangle" },
        modulationEnvelope: { attack: 0.2, decay: 0.3, sustain: 0.5, release: 1.0 }
    },
    "swell": {
        type: "FM",
        harmonicity: 2,
        modulationIndex: 3,
        oscillator: { type: "triangle" },
        envelope: { attack: 0.5, decay: 1.0, sustain: 0.5, release: 2.0 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 0.3, decay: 0.8, sustain: 0.3, release: 1.5 }
    }
};

class ToneInterface {
    note: ToneNote;
    synths: object;
    panner: Tone.PanVol;
    reverb: Tone.JCReverb;
    masterVolume: Tone.Volume;
    soundPresets: { H: string; V: string };
    axisVolume: { H: number; V: number };

    constructor() {
        // Limiter prevents distortion, allowing higher volume safely
        var limiter = new Tone.Limiter(-1).toMaster();
        this.masterVolume = new Tone.Volume(3).connect(limiter);
        this.reverb = new Tone.JCReverb({
            roomSize: 0.9
        });
        this.reverb.wet.value = 0.3;
        this.reverb.connect(this.masterVolume);
        this.synths = new Object();
        this.soundPresets = { H: "chime", V: "vibes" };
        this.axisVolume = { H: 1.0, V: 1.0 };
    }

    makeString(horizOrVert: string) {
        var presetName = this.soundPresets[horizOrVert] || (horizOrVert === "H" ? "chime" : "vibes");
        var preset = soundPresets[presetName];

        if (!preset) {
            preset = soundPresets["vibes"]; // fallback
        }

        return new Tone.FMSynth({
            harmonicity: preset.harmonicity,
            modulationIndex: preset.modulationIndex,
            oscillator: { type: preset.oscillator.type },
            envelope: preset.envelope,
            modulation: { type: preset.modulation.type },
            modulationEnvelope: preset.modulationEnvelope
        });
    }

    setWaveType(horizOrVert: string, presetName: string) {
        this.soundPresets[horizOrVert] = presetName;
    }

    static getSoundPresetNames(): string[] {
        return Object.keys(soundPresets);
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

    setAxisVolume(axis: string, volume: number) {
        this.axisVolume[axis] = volume;
    }

    playString(line: object, pitch: number, volume: number, planetMass:number, pan:number, horizOrVert: string) {
        var string = line.string;
        var panner = line.panner;
        // Apply axis volume (0-1 multiplier, convert to dB: 0 = -Infinity, 1 = 0dB)
        var axisVol = this.axisVolume[horizOrVert];
        if (axisVol === undefined) axisVol = 1.0;
        // Scale volume: at axisVol=1, no change; at axisVol=0, reduce by 40dB
        var axisDbOffset = (axisVol - 1.0) * 40;
        panner.volume.value = volume + axisDbOffset;
        if (pan != null) panner.pan.value = pan;
        string.connect(panner);
        string.triggerAttackRelease(pitch, 0.1);
    }
}