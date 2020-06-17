//typescript file to play midi
interface MidiNote {
    note: string
    velocity: number
    duration: number
}

 class MidiInterface {
     note: MidiNote;
     outputChannel: number;
     outputDevice: number;
     midiDevices: string[];
     enabled: boolean;
     isPlaying: boolean;

     constructor(callback:function) {
         var self = this;
         this.midiDevices = [];
         this.outputDevice = 0;
         this.enabled = false;
         this.isPlaying = false;
         WebMidi.enable(function (err) {
            if (err) {
                console.log("%cWEBMIDI COULD NOT BE ENABLED", "color:#fff;font-weight:bold;background:#f00");
            } else {
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

    };

     playNote(pitch: string, velocity: number, duration: number, channel:number) {
         if (this.enabled && this.isPlaying) WebMidi.outputs[this.outputDevice].playNote(pitch, channel, { duration: duration, velocity: velocity });
    };

     stopAll() {
         this.isPlaying = false;
         WebMidi.outputs[this.outputDevice].sendStop();
    };

    getMidiDeviceNames() {
        return this.midiDevices;
    };

     setOutputByName(outputDeviceName) {
         console.log("~~~~~~   setOutput");
         for (var i = 0; i < this.midiDevices.length; i++) {
             if (this.midiDevices[i] = outputDeviceName) {
                 this.outputDevice = i;
             }
         }
         this.setOutput(i);;
     };

     setOutput(outputDeviceNumber) {
         this.outputDevice = outputDeviceNumber;
     };
}

//const midiInterface: MidiInterface = new MidiInterface();
