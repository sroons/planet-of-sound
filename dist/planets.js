var simulation = function () { };
simulation.prototype = {
    G: 10000,
    PATH_MAX_POINTS: 100,
    MAX_DELTA: 0.03,
    STEPS: 25,
    MINV: 1,
    MAXV: 150,
    MINDB: Math.log(1),
    MAXDB: Math.log(100),
    GRIDSIZE_H: 50,
    GRIDSIZE_V: 50,
    center: 0,
    systems: null,
    planets: [],
    GRID: { HORIZONTALS: [], VERTICALS: [] },
    gridlineCrossedX: -1,
    gridlneCrossedY: -1,
    CANVAS_RECT: {},
    select: null,
    octave: 1,
    scaleToPlay: {},
    scales: null,
    midiInterface: null,
    midiSelect: null,
    gridSizeSelect_h: null,
    gridSizeSelect_v: null,
    toneSelect_h: null,
    toneSelect_v: null,
    midiRange: [-1, 4],
    toneRange: [0, 6],
    title: "Planet Tones",
    randomizeOctaves_h: false,
    randomizeOctaves_v: false,
    playDrones: true,
    autoZoom: false,
    autoZoomPadding: 0.15,
    currentScale: 1,
    targetScale: 1,
    scaleLerpSpeed: 0.03,
    lastScale: 1,
    zoomTimeout: null,
    init: function (systems, scales) {
        var self = this;
        this.midiInterface = new MidiInterface(function (msg) {
            self.addAudioOptions();
        });
        this.toneInterface = new ToneInterface();
        this.center = view.center;
        this.scales = scales;
        this.systems = systems;
        //this.drawTitle();
        this.addOptions();
        this.setGridSize();
        this.initializeGrid();
        this.initializePlanets();
        this.initZoomControls();
    },
    setGridSize: function () {
        if (this.gridSizeSelect_h == undefined)
            this.gridSizeSelect_h = document.getElementById("gridSize_h");
        if (this.gridSizeSelect_v == undefined)
            this.gridSizeSelect_v = document.getElementById("gridSize_v");
        this.GRIDSIZE_H = parseInt(this.gridSizeSelect_h.options[this.gridSizeSelect_h.selectedIndex].value);
        this.GRIDSIZE_V = parseInt(this.gridSizeSelect_v.options[this.gridSizeSelect_v.selectedIndex].value);
    },
    resetGrid: function () {
        this.setGridSize();
        this.clearGrid();
        this.initializeGrid();
    },
    drawTitle: function () {
        this.titleText = new PointText(new Point(16, 8));
        this.titleText.fillColor = this.titleText.strokeColor = "#ddd";
        this.titleText.fontSize = 24;
        this.titleText.fontWeight = 400;
        this.titleText.content = this.title;
        console.log('title :: ' + this.title);
    },
    initializeGrid: function () {
        var c = document.getElementById("canvas");
        this.CANVAS_RECT = c.getBoundingClientRect();
        this.GRID.VERTICALS = [];
        this.GRID.HORIZONTALS = [];
        // Calculate number of lines needed to cover screen from center
        var halfWidth = this.CANVAS_RECT.width / 2;
        var halfHeight = this.CANVAS_RECT.height / 2;
        var numLinesV = Math.ceil(halfWidth / this.GRIDSIZE_V) + 1;
        var numLinesH = Math.ceil(halfHeight / this.GRIDSIZE_H) + 1;
        // Create vertical lines from center outward (both directions)
        this.octave = 0;
        for (var x = -numLinesV; x <= numLinesV; x++) {
            var simX = this.GRIDSIZE_V * x; // Simulation coordinate (0 = center)
            var lineIndex = Math.abs(x) || 1; // Use 1 for center line pitch
            var midiPitch = this.getPitch(lineIndex, "v", "midi");
            var tonePitch = this.getPitch(lineIndex, "v", "audio");
            var screenX = view.center.x - simX;
            var line = new GridLine(Math.floor(simX), 0, this.CANVAS_RECT.height, 0.2, midiPitch, tonePitch, "vertical");
            line.simX = simX;
            line.path = new Path.Line(new Point(screenX, 0), new Point(screenX, this.CANVAS_RECT.height));
            line.path.strokeColor = line.color;
            line.path.opacity = 0.3;
            var pan = this.convertRange(screenX, [0, this.CANVAS_RECT.width], [-1, 1]);
            line.string = this.toneInterface.makeString("V");
            line.panner = this.toneInterface.makeStringPanner(pan);
            this.GRID.VERTICALS.push(line);
        }
        // Create horizontal lines from center outward (both directions)
        this.octave = 0;
        for (var y = -numLinesH; y <= numLinesH; y++) {
            var simY = this.GRIDSIZE_H * y; // Simulation coordinate (0 = center)
            var lineIndex = Math.abs(y) || 1;
            var midiPitch = this.getPitch(lineIndex, "h", "midi");
            var tonePitch = this.getPitch(lineIndex, "h", "audio");
            var screenY = view.center.y - simY;
            var line = new GridLine(0, Math.floor(simY), this.CANVAS_RECT.width, 0.2, midiPitch, tonePitch, "horizontal");
            line.simY = simY;
            line.path = new Path.Line(new Point(0, screenY), new Point(this.CANVAS_RECT.width, screenY));
            line.path.strokeColor = line.color;
            line.path.opacity = 0.3;
            line.string = this.toneInterface.makeString("H");
            line.panner = this.toneInterface.makeStringPanner(0.5);
            this.GRID.HORIZONTALS.push(line);
        }
    },
    getPitch: function (lineNum, horizOrVert, midiOrAudio) {
        if (this.scaleToPlay.h == undefined) {
            this.scaleToPlay.h = this.scales[this.h_scaleSelect.options[this.h_scaleSelect.selectedIndex].value];
            this.scaleToPlay.v = this.scales[this.v_scaleSelect.options[this.v_scaleSelect.selectedIndex].value];
        }
        ;
        var scale = this.scaleToPlay[horizOrVert];
        var gridSize = (horizOrVert == "h") ? this.GRIDSIZE_H : this.GRIDSIZE_V;
        var numGridLines = (horizOrVert == "h") ? this.CANVAS_RECT.height / gridSize : this.CANVAS_RECT.width / gridSize;
        var randomize = (horizOrVert == "h") ? this.randomizeOctaves_h : this.randomizeOctaves_v;
        var octave;
        if (randomize == true) {
            octave = Math.floor(Math.random() * 9);
        }
        else {
            octave = Math.floor(this.convertRange(lineNum, [0, numGridLines], [0, 8]));
        }
        var pitch = scale[lineNum % scale.length] + "" + octave;
        return pitch;
    },
    addOptions: function (systems) {
        this.select = document.getElementById("system");
        var self = this;
        this.select.addEventListener('change', function () {
            self.initializePlanets();
        }, false);
        for (var system in this.systems) {
            this.select.options[this.select.options.length] = new Option(system, system);
        }
        // Horizontal scale dropdown
        this.h_scaleSelect = document.getElementById("scale_h");
        this.h_scaleSelect.addEventListener('change', function () {
            self.initializeScale("h");
        }, false);
        for (var scale in this.scales) {
            var opt = new Option(scale, scale);
            if (scale === "c-major")
                opt.selected = true;
            this.h_scaleSelect.options[this.h_scaleSelect.options.length] = opt;
        }
        // Vertical scale dropdown
        this.v_scaleSelect = document.getElementById("scale_v");
        this.v_scaleSelect.addEventListener('change', function () {
            self.initializeScale("v");
        }, false);
        for (var scale in this.scales) {
            var opt = new Option(scale, scale);
            if (scale === "c-major")
                opt.selected = true;
            this.v_scaleSelect.options[this.v_scaleSelect.options.length] = opt;
        }
        // Horizontal linespacing (grid size) dropdown
        this.gridSizeSelect_h = document.getElementById("gridSize_h");
        this.gridSizeSelect_h.addEventListener('change', function () {
            self.resetGrid();
        }, false);
        this.gridSizeSelect_h.value = "25";
        // Vertical gridsize dropdown
        this.gridSizeSelect_v = document.getElementById("gridSize_v");
        this.gridSizeSelect_v.addEventListener('change', function () {
            self.resetGrid();
        }, false);
        this.gridSizeSelect_v.value = "25";
        // Horizontal tone dropdown
        this.toneSelect_h = document.getElementById("tone_h");
        this.populateToneOptions(this.toneSelect_h, "chime");
        this.toneSelect_h.addEventListener('change', function () {
            self.setTone("h");
        }, false);
        // Vertical tone dropdown
        this.toneSelect_v = document.getElementById("tone_v");
        this.populateToneOptions(this.toneSelect_v, "vibes");
        this.toneSelect_v.addEventListener('change', function () {
            self.setTone("v");
        }, false);
        // Randomize octave toggles
        this.randomizeOctavesCheckbox_h = document.getElementById("randomizeOctaves_h");
        this.randomizeOctavesCheckbox_h.addEventListener('change', function () {
            self.setRandomizeOctaves("h");
        });
        this.randomizeOctavesCheckbox_v = document.getElementById("randomizeOctaves_v");
        this.randomizeOctavesCheckbox_v.addEventListener('change', function () {
            self.setRandomizeOctaves("v");
        });
    },
    populateToneOptions: function (selectElement, defaultPreset) {
        // Sound presets organized by category
        var presets = [
            // Short/Percussive
            { name: "pluck", label: "Pluck (short)" },
            { name: "click", label: "Click (very short)" },
            { name: "tick", label: "Tick (crisp)" },
            // Metallic
            { name: "bell", label: "Bell (metallic)" },
            { name: "chime", label: "Chime (metallic)" },
            { name: "gong", label: "Gong (long metallic)" },
            { name: "metallic", label: "Metallic (harsh)" },
            // Gritty
            { name: "buzz", label: "Buzz (gritty)" },
            { name: "growl", label: "Growl (dark)" },
            { name: "zap", label: "Zap (electric)" },
            { name: "crunch", label: "Crunch (harsh)" },
            // Mellow
            { name: "soft", label: "Soft (gentle)" },
            { name: "warm", label: "Warm (mellow)" },
            { name: "pad", label: "Pad (atmospheric)" },
            { name: "flute", label: "Flute (breathy)" },
            // Mallet/Keyboard
            { name: "vibes", label: "Vibes (vibraphone)" },
            { name: "marimba", label: "Marimba (wood)" },
            { name: "kalimba", label: "Kalimba (thumb piano)" },
            { name: "glass", label: "Glass (crystalline)" },
            // Long sustain
            { name: "drone", label: "Drone (sustained)" },
            { name: "swell", label: "Swell (slow attack)" }
        ];
        for (var i = 0; i < presets.length; i++) {
            var opt = new Option(presets[i].label, presets[i].name);
            if (presets[i].name === defaultPreset)
                opt.selected = true;
            selectElement.options[selectElement.options.length] = opt;
        }
    },
    setTone: function (horizOrVert) {
        var selectElement = (horizOrVert === "h") ? this.toneSelect_h : this.toneSelect_v;
        var tone = selectElement.options[selectElement.selectedIndex].value;
        if (this.toneInterface) {
            this.toneInterface.setWaveType(horizOrVert.toUpperCase(), tone);
            this.clearGrid();
            this.initializeGrid();
        }
    },
    setRandomizeOctaves: function (horizOrVert) {
        if (horizOrVert === "h") {
            this.randomizeOctaves_h = this.randomizeOctavesCheckbox_h.checked;
        }
        else {
            this.randomizeOctaves_v = this.randomizeOctavesCheckbox_v.checked;
        }
        this.clearGrid();
        this.initializeGrid();
    },
    addAudioOptions: function () {
        var self = this;
        this.midiSelect = document.getElementById("midiOutput");
        this.midiSelect.addEventListener('change', function () {
            self.setMidiDevice();
        }, false);
        var devices = this.midiInterface.getMidiDeviceNames();
        for (var i = 0; i < devices.length; i++) {
            device = devices[i];
            this.midiSelect.options[this.midiSelect.options.length] = new Option(device, device);
        }
        ;
        this.midiSelect.options[this.midiSelect.options.length] = new Option("web audio", "webaudio");
    },
    setMidiDevice: function () {
        this.midiInterface.setOutput(this.midiSelect.selectedIndex);
    },
    initializePlanets: function () {
        this.clearPlanets();
        this.planets = [];
        var planets = this.systems[this.select.options[this.select.selectedIndex].value];
        for (var i in planets) {
            var planet = {
                mass: planets[i].mass,
                position: new Point(planets[i].x, planets[i].y),
                velocity: new Point(planets[i].velX, planets[i].velY),
                color: planets[i].color,
                waveType: planets[i].soundWave,
                lastCrossedLine_H: -1,
                lastCrossedLine_V: -1
            };
            this.planets.push(planet);
        }
        this.LASTY = this.LASTX = -1;
        this.draw();
    },
    initializeScale: function (whichScale) {
        var scaleSelect = whichScale + "_scaleSelect";
        this.scaleToPlay[whichScale] = this.scales[this[scaleSelect].options[this[scaleSelect].selectedIndex].value];
        this.drones = [this.scaleToPlay[whichScale][0], this.scaleToPlay[whichScale][2]];
        if (this.playDrones == true && this.midiInterface && this.midiInterface.output) {
            this.midiInterface.playDrone(this.drones[0], 3);
            this.midiInterface.playDrone(this.drones[1], 4);
        }
        this.clearGrid();
        this.initializeGrid();
    },
    clearGrid: function () {
        for (var i = 0; i < this.GRID.VERTICALS.length; i++) {
            var line = this.GRID.VERTICALS[i];
            if (line.path != undefined) {
                line.path.remove();
            }
            if (line.text != undefined) {
                line.text.remove();
            }
        }
        for (var i = 0; i < this.GRID.HORIZONTALS.length; i++) {
            var line = this.GRID.HORIZONTALS[i];
            if (line.path != undefined) {
                line.path.remove();
            }
            if (line.text != undefined) {
                line.text.remove();
            }
        }
    },
    clearPlanets: function () {
        for (var i in this.planets) {
            this.planets[i].circle.remove();
            this.planets[i].path.remove();
        }
    },
    draw: function () {
        for (var i in this.planets) {
            var planet = this.planets[i];
            var baseRadius = Math.max(Math.min(Math.pow(planet.mass, 1 / 3), 5), 2);
            planet.baseRadius = baseRadius; // Store base radius for scaling
            var radius = baseRadius * this.currentScale;
            planet.circle = new Path.Circle(this.paperCoordinates(planet.position), radius);
            planet.circle.strokeColor = planet.color;
            planet.circle.fillColor = planet.color;
            planet.path = new Path();
            planet.path.strokeColor = planet.color;
            planet.path.add(new Point(this.paperCoordinates(planet.position)));
        }
    },
    getPositions: function () {
        var pos = new Array(this.planets.length);
        for (var i in this.planets) {
            pos[i] = this.planets[i].position;
        }
        return pos;
    },
    getVelocities: function () {
        var vel = new Array(this.planets.length);
        for (var i in this.planets) {
            vel[i] = this.planets[i].velocity;
        }
        return vel;
    },
    calculateAcceleration: function (positions) {
        var acc = new Array(this.planets.length);
        for (var i in this.planets) {
            acc[i] = new Point(0, 0);
        }
        for (var i in this.planets) {
            for (var j = 0; j < i; j++) {
                var d = positions[j] - positions[i];
                var r2 = Math.pow(d.length, 2);
                var f = d.normalize() * this.G * this.planets[i].mass * this.planets[j].mass / r2;
                acc[i] += f / this.planets[i].mass;
                acc[j] -= f / this.planets[j].mass;
            }
        }
        return acc;
    },
    calculateVelocities: function (acc, dt) {
        var vel = new Array(this.planets.length);
        for (var i in this.planets) {
            vel[i] = this.planets[i].velocity + acc[i] * dt;
        }
        return vel;
    },
    updateVelocities: function (vel) {
        for (var i in this.planets) {
            this.planets[i].velocity = vel[i];
        }
    },
    calculatePositions: function (vel, dt) {
        var pos = new Array(this.planets.length);
        for (var i in this.planets) {
            pos[i] = this.planets[i].position + vel[i] * dt;
        }
        return pos;
    },
    updatePositions: function (positions) {
        for (var i in this.planets) {
            var planet = this.planets[i];
            planet.position = positions[i];
            this.checkForMidiNote(planet);
        }
    },
    checkForMidiNote: function (planet) {
        var gridlineCrossedX = this.checkGridCrossingX(planet);
        if (gridlineCrossedX > -1) {
            var gridline = this.GRID.VERTICALS[gridlineCrossedX];
            //console.log("%cvertical gridline crossed :: " + gridlineCrossedX, "background:" + planet.color);
            //color the line red
            this.setLinePlucked(gridline, planet, gridlineCrossedX, "H");
            //make a midi note from the line properties
            this.makeNote(gridline, planet, "x", "H");
        }
        var gridlineCrossedY = this.checkGridCrossingY(planet);
        if (gridlineCrossedY > -1) {
            var gridline = this.GRID.HORIZONTALS[gridlineCrossedY];
            this.setLinePlucked(gridline, planet, gridlineCrossedY, "V");
            //console.log("%chorizontal gridline crossed :: " + gridlineCrossedY, "background:" + planet.color);
            //make a midinote from the line properties
            this.makeNote(gridline, planet, "y", "V");
        }
    },
    LASTX: 0,
    LASTY: 0,
    checkGridCrossingX: function (planet) {
        if (!planet.circle)
            return -1;
        // Use cached radius or calculate once
        if (!planet.cachedRadius) {
            planet.cachedRadius = Math.floor(planet.circle.bounds.width / 2);
        }
        // Calculate which grid line index this position corresponds to (O(1) instead of O(n))
        var scaledX = planet.position.x * this.currentScale;
        var lineIndex = Math.round(scaledX / this.GRIDSIZE_V);
        // Find the line in our array (lines are indexed from -numLines to +numLines)
        var numLinesV = Math.ceil((this.CANVAS_RECT.width / 2) / this.GRIDSIZE_V) + 1;
        var arrayIndex = lineIndex + numLinesV;
        // Check bounds and if this is a new crossing
        if (arrayIndex >= 0 && arrayIndex < this.GRID.VERTICALS.length) {
            var line = this.GRID.VERTICALS[arrayIndex];
            if (line && Math.abs(scaledX - line.simX * this.currentScale) < 2) {
                if (arrayIndex != planet.lastCrossedLine_V) {
                    planet.lastCrossedLine_V = arrayIndex;
                    return arrayIndex;
                }
            }
        }
        return -1;
    },
    checkGridCrossingY: function (planet) {
        if (!planet.circle)
            return -1;
        // Calculate which grid line index this position corresponds to (O(1) instead of O(n))
        var scaledY = planet.position.y * this.currentScale;
        var lineIndex = Math.round(scaledY / this.GRIDSIZE_H);
        // Find the line in our array (lines are indexed from -numLines to +numLines)
        var numLinesH = Math.ceil((this.CANVAS_RECT.height / 2) / this.GRIDSIZE_H) + 1;
        var arrayIndex = lineIndex + numLinesH;
        // Check bounds and if this is a new crossing
        if (arrayIndex >= 0 && arrayIndex < this.GRID.HORIZONTALS.length) {
            var line = this.GRID.HORIZONTALS[arrayIndex];
            if (line && Math.abs(scaledY - line.simY * this.currentScale) < 2) {
                if (arrayIndex != planet.lastCrossedLine_H) {
                    planet.lastCrossedLine_H = arrayIndex;
                    return arrayIndex;
                }
            }
        }
        return -1;
    },
    makeNote: function (gridline, planet, whichVelocity, horizOrVert) {
        if (!this.midiSelect || this.midiSelect.value == "webaudio") {
            //user has selected web audio (or MIDI not yet initialized)
            this.makeToneNote(gridline, planet, whichVelocity, horizOrVert);
        }
        else {
            this.makeMidiNote(gridline, planet, whichVelocity, horizOrVert);
        }
    },
    makeMidiNote: function (gridline, planet, whichVelocity, horizOrVert) {
        //call midi functionality here;
        var planetVelocity = Math.abs(Math.floor(planet.velocity[whichVelocity]));
        var velocity = this.convertRange(planetVelocity, [10, 500], [50, 127]);
        var duration = planet.mass;
        var channel = horizOrVert == "H" ? 1 : 2;
        this.midiInterface.playNote(gridline.midiNote, velocity, duration, channel);
    },
    //note -- for web audio every string should have its own synth
    makeToneNote: function (gridline, planet, whichVelocity, horizOrVert) {
        var xrange = [0, this.CANVAS_RECT.width];
        var pan = (horizOrVert == "H" ? this.getPlanetSoundPan(this.paperCoordinates(planet.position).x) : null);
        var planetVelocity = Math.abs(Math.floor(planet.velocity[whichVelocity]));
        ;
        //var velocity = this.convertRange(planetVelocity, [10, 500], [50, 127]);
        var volume = this.velocitytToDb(planetVelocity);
        var pitch = gridline.webAudioNote;
        this.toneInterface.playString(gridline, pitch, volume, planet.mass, pan);
    },
    PAN_RANGE: [-1, 1],
    getPlanetSoundPan: function (val) {
        if (this.X_RANGE == undefined) {
            if (this.CANVAS_RECT != undefined) {
                this.X_RANGE = [0, this.CANVAS_RECT.width];
            }
            else {
                return false;
            }
        }
        return this.convertRange(val, this.X_RANGE, this.PAN_RANGE);
    },
    /*getPlanetSoundFrequency: function (val) {
        return this.pixelToFreq(val);
    },
    getPlanetSoundVolume: function (val) {
        return this.velocitytToDb(val - 50);
    },*/
    VELOCITY_RANGE: [0, 800],
    DB_RANGE: [-20, 0],
    velocitytToDb: function (val) {
        var newVol = this.convertRange(val, this.VELOCITY_RANGE, this.DB_RANGE);
        //failsafe so we don't blow out speakers
        if (newVol > this.DB_RANGE[1])
            return this.DB_RANGE[1];
        return newVol;
    },
    /*
    PIXEL_RANGE: [-100, 100],
    FREQUENCY_RANGE: [4, 440],
    pixelToFreq: function (val) {
        var newFreq = this.convertRange(val, this.PIXEL_RANGE, this.FREQUENCY_RANGE);
        //failsafe
        if (newFreq > 1000) return 1000;
        return newFreq;
    },
    */
    convertRange: function (input, r1, r2) {
        return (input - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
    },
    getPerceivedVelocity: function (planet) {
        var velX = Math.abs(planet.velocity.x);
        var velY = Math.abs(planet.velocity.y);
        if (velX > velY) {
            return velX;
        }
        else {
            return velY;
        }
    },
    updateRepresentation: function () {
        for (var i in this.planets) {
            this.updatePlanetRepresentation(this.planets[i]);
        }
        // Only update grid positions when scale has changed
        var scaleChanged = Math.abs(this.currentScale - this.lastScale) > 0.001;
        if (scaleChanged) {
            for (var i = 0; i < this.GRID.VERTICALS.length; i++) {
                this.updateGridLine(this.GRID.VERTICALS[i]);
            }
            for (var i = 0; i < this.GRID.HORIZONTALS.length; i++) {
                this.updateGridLine(this.GRID.HORIZONTALS[i]);
            }
            this.lastScale = this.currentScale;
        }
        // Only update plucked lines (for animation)
        for (var i = 0; i < this.pluckedLines.length; i++) {
            var line = this.pluckedLines[i];
            if (line && line.path) {
                if (line.plucked) {
                    line.path.strokeColor = line.pluckedColor;
                    line.path.opacity -= 0.03;
                }
            }
        }
    },
    updatePlanetRepresentation: function (planet) {
        if (!planet.circle || !planet.path)
            return;
        planet.circle.position = this.paperCoordinates(planet.position);
        // Only scale circle when zoom scale has changed
        if (planet.baseRadius && planet.lastAppliedScale !== this.currentScale) {
            var targetRadius = planet.baseRadius * this.currentScale;
            var currentRadius = planet.circle.bounds.width / 2;
            if (currentRadius > 0) {
                planet.circle.scale(targetRadius / currentRadius);
                planet.lastAppliedScale = this.currentScale;
            }
        }
        planet.path.add(this.paperCoordinates(planet.position));
        if (planet.path.segments.length > this.PATH_MAX_POINTS) {
            planet.path.removeSegments(0, 1);
        }
    },
    // Update grid line position (called only when scale changes)
    updateGridLine: function (line) {
        if (line.path != undefined) {
            if (line.simX !== undefined) {
                var screenX = view.center.x - (line.simX * this.currentScale);
                var segments = line.path.segments;
                segments[0].point.x = screenX;
                segments[1].point.x = screenX;
                line.x = Math.floor(line.simX * this.currentScale);
            }
            if (line.simY !== undefined) {
                var screenY = view.center.y - (line.simY * this.currentScale);
                var segments = line.path.segments;
                segments[0].point.y = screenY;
                segments[1].point.y = screenY;
                line.y = Math.floor(line.simY * this.currentScale);
            }
        }
    },
    // Update grid line visual appearance (called every frame for pluck animation)
    updateGridLineVisual: function (line) {
        if (line.path != undefined) {
            if (line.plucked) {
                line.path.strokeColor = line.pluckedColor;
                line.path.opacity -= 0.03;
            }
            else {
                line.path.strokeColor = line.color;
                line.path.opacity = 0.3;
            }
        }
    },
    // Auto-zoom: calculate bounding box of all planets
    getPlanetBounds: function () {
        if (this.planets.length === 0)
            return null;
        var minX = Infinity, maxX = -Infinity;
        var minY = Infinity, maxY = -Infinity;
        for (var i in this.planets) {
            var pos = this.planets[i].position;
            if (pos.x < minX)
                minX = pos.x;
            if (pos.x > maxX)
                maxX = pos.x;
            if (pos.y < minY)
                minY = pos.y;
            if (pos.y > maxY)
                maxY = pos.y;
        }
        return {
            minX: minX,
            maxX: maxX,
            minY: minY,
            maxY: maxY,
            width: maxX - minX,
            height: maxY - minY,
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2
        };
    },
    // Auto-zoom: calculate scale to fit planets in view
    updateAutoZoom: function () {
        if (!this.autoZoom) {
            // Manual zoom - don't change scale
            return;
        }
        var bounds = this.getPlanetBounds();
        if (!bounds)
            return;
        // Add padding to bounds
        var padding = this.autoZoomPadding;
        var paddedWidth = bounds.width * (1 + padding * 2);
        var paddedHeight = bounds.height * (1 + padding * 2);
        // Ensure minimum size to avoid extreme scale
        var minSize = 100;
        paddedWidth = Math.max(paddedWidth, minSize);
        paddedHeight = Math.max(paddedHeight, minSize);
        // Calculate scale needed to fit planets in viewport
        // We want the simulation to appear smaller when planets spread out
        var viewWidth = view.viewSize.width;
        var viewHeight = view.viewSize.height;
        // Use smaller dimension to ensure everything fits
        var scaleX = viewWidth / paddedWidth;
        var scaleY = viewHeight / paddedHeight;
        this.targetScale = Math.min(scaleX, scaleY);
        // Clamp scale to reasonable range
        this.targetScale = Math.max(0.2, Math.min(this.targetScale, 2));
        // Smoothly interpolate toward target scale
        this.currentScale += (this.targetScale - this.currentScale) * this.scaleLerpSpeed;
    },
    setAutoZoom: function (enabled) {
        this.autoZoom = enabled;
    },
    // Manual zoom with mouse wheel/trackpad
    manualZoom: function (delta) {
        var self = this;
        // Disable auto-zoom when manually zooming
        if (this.autoZoom) {
            this.autoZoom = false;
            var autoZoomToggle = document.getElementById("autoZoom");
            if (autoZoomToggle)
                autoZoomToggle.checked = false;
        }
        // Adjust scale based on wheel delta
        var zoomFactor = 1 + (delta * 0.001);
        this.targetScale = this.currentScale * zoomFactor;
        // Clamp scale to reasonable range
        this.targetScale = Math.max(0.1, Math.min(this.targetScale, 5));
        this.currentScale = this.targetScale;
        // Debounced grid redraw after zooming stops
        if (this.zoomTimeout)
            clearTimeout(this.zoomTimeout);
        this.zoomTimeout = setTimeout(function () {
            self.resetGrid();
        }, 300);
    },
    initZoomControls: function () {
        var self = this;
        var canvas = document.getElementById("canvas");
        // Mouse wheel zoom
        canvas.addEventListener("wheel", function (e) {
            e.preventDefault();
            // Invert delta so scroll up = zoom in
            self.manualZoom(-e.deltaY);
        }, { passive: false });
    },
    T: 0,
    pluckedLines: [],
    timeouts: [],
    setLinePlucked: function (line, planet, lineNum, lineTypeProperty) {
        line.plucked = true;
        line.pluckedColor = planet.color;
        var lineTypeProperty = "lastCrossedLine_" + lineTypeProperty;
        planet[lineTypeProperty] = lineNum;
        this.pluckedLines.push(line);
        line.path.opacity = 1;
        var self = this;
        var t = setTimeout(function () { self.clearLinePlucked(line, planet, lineTypeProperty); }, 500);
        this.timeouts.push(t);
    },
    clearLinePlucked: function (line, planet, lineTypeProperty) {
        line.plucked = false;
        line.path.opacity = 0.3;
        line.path.strokeColor = line.color;
        // Remove from pluckedLines array
        var idx = this.pluckedLines.indexOf(line);
        if (idx > -1)
            this.pluckedLines.splice(idx, 1);
        var timeout = this.timeouts.shift();
        clearTimeout(timeout);
        planet[lineTypeProperty] = -1;
    },
    paperCoordinates: function (point) {
        // Apply auto-zoom scale factor to the offset from center
        var scaled = point * this.currentScale;
        return view.center - scaled;
    },
    simulate: function (delta) {
        var v1 = this.getVelocities();
        var p1 = this.getPositions();
        var a1 = this.calculateAcceleration(p1);
        var v2 = this.calculateVelocities(a1, delta / 2);
        var p2 = this.calculatePositions(v1, delta / 2);
        var a2 = this.calculateAcceleration(p2);
        var v3 = this.calculateVelocities(a2, delta / 2);
        var p3 = this.calculatePositions(v2, delta / 2);
        var a3 = this.calculateAcceleration(p3);
        var v4 = this.calculateVelocities(a3, delta);
        var p4 = this.calculatePositions(v3, delta);
        var a4 = this.calculateAcceleration(p4);
        var acc = new Array(this.planets.length);
        var vel = new Array(this.planets.length);
        for (var i in this.planets) {
            acc[i] = a1[i] / 6 + a2[i] / 3 + a3[i] / 3 + a4[i] / 6;
            vel[i] = v1[i] / 6 + v2[i] / 3 + v3[i] / 3 + v4[i] / 6;
        }
        this.updatePositions(this.calculatePositions(vel, delta));
        this.updateVelocities(this.calculateVelocities(acc, delta));
    },
    stopMidi: function () {
        this.midiInterface.stopAll();
    },
    /* onFrame updated every tick */
    onFrame: function (event) {
        var delta = event.delta;
        if (delta > this.MAX_DELTA)
            delta = this.MAX_DELTA;
        for (var i = 0; i < this.STEPS; i++) {
            this.simulate(delta / this.STEPS);
        }
        this.updateRepresentation();
        this.updateAutoZoom();
    }
};
var colors = [
    "#ff00d4",
    "#0099ff",
    "#ffbf00",
    "#6aff00",
    "#00ffd9",
    "#ff5e00",
    "#ff00d4",
    "#00ffe1",
    "#ffff0a",
    "#0aff6c",
];
function three_body(p1, p2) {
    return [{
            mass: 100,
            x: -100,
            y: 0,
            velX: 100 * p1,
            velY: 100 * p2,
            color: getColor(1),
            soundWave: "sine2"
        },
        {
            mass: 100,
            x: 100,
            y: 0,
            velX: 100 * p1,
            velY: 100 * p2,
            color: getColor(2),
            soundWave: "sine4"
        },
        {
            mass: 100,
            x: 0,
            y: 0,
            velX: -200 * p1,
            velY: -200 * p2,
            color: getColor(3),
            soundWave: "sine6"
        },
    ];
}
var systems = {
    // http://phet.colorado.edu/sims/my-solar-system/my-solar-system_en.html
    test: [{
            mass: 200,
            x: 0,
            y: 0,
            velX: 0,
            velY: -6.5,
            color: getColor(0),
            soundWave: "sine2"
        },
        {
            mass: 10,
            x: 160,
            y: 0,
            velX: 0,
            velY: 120,
            color: getColor(1),
            soundWave: "sine4"
        },
    ],
    sun_planet_moon: [{
            mass: 200,
            x: 0,
            y: 0,
            velX: 0,
            velY: -6.5,
            color: getColor(0),
            soundWave: "sine2"
        },
        {
            mass: 10,
            x: 160,
            y: 0,
            velX: 0,
            velY: 120,
            color: getColor(1),
            soundWave: "sine4"
        },
        {
            mass: 0.001,
            x: 140,
            y: 0,
            velX: 0,
            velY: 53,
            color: getColor(2),
            soundWave: "sine6"
        }
    ],
    two_stars: [
        {
            mass: 50,
            x: -100,
            y: 0,
            velX: 0,
            velY: -20,
            color: getColor(0),
        },
        {
            mass: 200,
            x: 100,
            y: 0,
            velX: 0,
            velY: 5,
            color: getColor(1),
        },
    ],
    four_star_ballet: [{
            mass: 120,
            x: -100,
            y: 100,
            velX: -50,
            velY: -50,
            color: getColor(0),
            soundWave: "sine2"
        },
        {
            mass: 120,
            x: 100,
            y: 100,
            velX: -50,
            velY: 50,
            color: getColor(1),
            soundWave: "sine4"
        },
        {
            mass: 120,
            x: 100,
            y: -100,
            velX: 50,
            velY: 50,
            color: getColor(2),
            soundWave: "sine6"
        },
        {
            mass: 120,
            x: -100,
            y: -100,
            velX: 50,
            velY: -50,
            color: getColor(3),
            soundWave: "sine8"
        }
    ],
    double_double: [{
            mass: 60,
            x: -115,
            y: -3,
            velX: 0,
            velY: -155,
            color: getColor(0),
            soundWave: "sine2"
        },
        {
            mass: 70,
            x: 102,
            y: 0,
            velX: 1,
            velY: 150,
            color: getColor(1),
            soundWave: "sine4"
        },
        {
            mass: 55,
            x: -77,
            y: -2,
            velX: -1,
            velY: 42,
            color: getColor(2),
            soundWave: "sine6"
        },
        {
            mass: 62,
            x: 135,
            y: 0,
            velX: -1,
            velY: -52,
            color: getColor(3),
            soundWave: "sine8"
        }
    ],
    sun_planet_comet: [{
            mass: 200,
            x: 0,
            y: 0,
            velX: 0,
            velY: 0,
            color: getColor(0),
            soundWave: "sine2"
        },
        {
            mass: 1,
            x: 150,
            y: 0,
            velX: 0,
            velY: 120,
            color: getColor(1),
            soundWave: "sine4"
        },
        {
            mass: 0.001,
            x: -220,
            y: 130,
            velX: -15,
            velY: -28,
            color: getColor(2),
            soundWave: "sine6"
        }
    ],
    ellipses: [{
            mass: 250,
            x: -200,
            y: 0,
            velX: 0,
            velY: 0,
            color: getColor(0),
            soundWave: "sine2"
        },
        {
            mass: 0.001,
            x: -115,
            y: 0,
            velX: 0,
            velY: 151,
            color: getColor(1),
            soundWave: "sine4"
        },
        {
            mass: 0.001,
            x: 50,
            y: 0,
            velX: 0,
            velY: 60,
            color: getColor(2),
            soundWave: "sine6"
        },
        {
            mass: 0.001,
            x: 220,
            y: 0,
            velX: 0,
            velY: 37,
            color: getColor(3),
            soundWave: "sine8"
        }
    ],
    //http://suki.ipb.ac.rs/3body
    broucke_henon: [{
            mass: 100,
            x: -100,
            y: 0,
            velX: 0,
            velY: -93.9325,
            color: getColor(0),
            soundWave: "sine2"
        },
        {
            mass: 100,
            x: 50,
            y: -64.7584,
            velX: -50.5328,
            velY: 46.96663,
            color: getColor(1),
            soundWave: "sine4"
        },
        {
            mass: 100,
            x: 50,
            y: 64.7584,
            velX: 50.5328,
            velY: 46.96663,
            color: getColor(2),
            soundWave: "sine6"
        }
    ],
    figure_8: three_body(0.347111, 0.532728),
    butterfly_1: three_body(0.306893, 0.125507),
    butterfly_2: three_body(0.392955, 0.097579),
    bumblebee: three_body(0.184279, 0.587188),
    dragonfly: three_body(0.080584, 0.588836),
    googles: three_body(0.083300, 0.127889),
    mouth_1: three_body(0.464445, 0.396060),
    mouth_2: three_body(0.439166, 0.452968),
    mouth_3: three_body(0.383444, 0.377364),
    butterfly_3: three_body(0.405916, 0.230163),
    butterfly_4: three_body(0.350112, 0.079339),
    yarn: three_body(0.559064, 0.349192),
    ying_yang: three_body(0.513938, 0.304736),
    ying_yang_1b: three_body(0.282699, 0.327209),
    ying_yang_2a: three_body(0.416822, 0.330333),
    ying_yang_2b: three_body(0.417343, 0.313100)
};
var scales = {};
function getScales() {
    // Add c-major first so it's the default
    scales["c-major"] = Tonal.Scale.get("C major").notes;
    var allScales = Tonal.Scale.names();
    var notes = null;
    for (var i = 0; i < allScales.length; i++) {
        notes = Tonal.Scale.get("C " + allScales[i]).notes;
        scaleName = "c-" + allScales[i].replace(/\s+/g, '-').toLowerCase();
        if (scaleName !== "c-major") {
            scales[scaleName] = notes;
        }
    }
}
getScales();
function getColor(colorNum) {
    if (colorNum == undefined)
        colorNum = Math.floor(Math.random() * colors.length);
    var clr = colors[colorNum];
    return clr;
}
var sim = new simulation();
window.sim = sim;
function initSystems() {
    sim.init(systems, scales);
}
function onFrame(event) {
    sim.onFrame(event);
}
function stopAll() {
    sim.clearPlanets();
    sim.stopMidi();
    //isRunning = false;
}
function restartAll() {
    //isRunning = true;
}
;
document.getElementById("stopButton").onclick = stopAll;
// Redraw grid on window resize or fullscreen change
var resizeTimeout;
window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
        sim.resetGrid();
    }, 250);
});
document.addEventListener("fullscreenchange", function () {
    setTimeout(function () {
        sim.resetGrid();
    }, 100);
});
sim.init(systems, scales);
