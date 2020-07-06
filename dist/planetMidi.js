var MidiInterface = /** @class */ (function () {
    function MidiInterface(callback) {
        var self = this;
        this.midiDevices = [];
        this.outputDevice = 0;
        this.enabled = false;
        this.isPlaying = false;
        WebMidi.enable(function (err) {
            if (err) {
                console.log("%cWEBMIDI COULD NOT BE ENABLED", "color:#fff;font-weight:bold;background:#f00");
            }
            else {
                console.log("%c~~~~WEBMIDI ENABLED~~~~", "color:#000;font-weight:bold;background:#0f0");
                self.setOutput(self.outputDevice);
                for (var i = 0; i < WebMidi.outputs.length; i++) {
                    self.midiDevices[i] = WebMidi.outputs[i].name;
                }
                console.log(self.midiDevices);
                self.enabled = true;
                self.isPlaying = true;
                callback("success");
            }
        });
    }
    ;
    MidiInterface.prototype.playNote = function (pitch, velocity, duration, channel) {
        if (this.enabled && this.isPlaying)
            WebMidi.outputs[this.outputDevice].playNote(pitch, channel, { duration: duration, velocity: velocity });
    };
    ;
    MidiInterface.prototype.playDrone = function (pitch, channel) {
        var noteName = pitch + "0";
        if (this.enabled && this.isPlaying)
            WebMidi.outputs[this.outputDevice].playNote(noteName, channel, { duration: 10000 });
    };
    MidiInterface.prototype.stopAll = function () {
        this.isPlaying = false;
        WebMidi.outputs[this.outputDevice].sendStop();
    };
    ;
    MidiInterface.prototype.getMidiDeviceNames = function () {
        return this.midiDevices;
    };
    ;
    MidiInterface.prototype.setOutputByName = function (outputDeviceName) {
        console.log("~~~~~~   setOutput");
        for (var i = 0; i < this.midiDevices.length; i++) {
            if (this.midiDevices[i] = outputDeviceName) {
                this.outputDevice = i;
            }
        }
        this.setOutput(i);
        ;
    };
    ;
    MidiInterface.prototype.setOutput = function (outputDeviceNumber) {
        this.outputDevice = outputDeviceNumber;
    };
    ;
    return MidiInterface;
}());
//const midiInterface: MidiInterface = new MidiInterface();
