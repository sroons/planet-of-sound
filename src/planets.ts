//import { MidiInterface } from "./planetMidi";
//import { Point } from "../paper.js";

var simulation = function () { }

simulation.prototype = {
    G: 10000,
    PATH_MAX_POINTS: 100,
    MAX_DELTA: 0.03,
    STEPS: 50,
    MINV: 1,
    MAXV: 150,
    MINDB: Math.log(1),
    MAXDB: Math.log(100),
    GRIDSIZE: 50,
    center: 0,
    systems: null,
    planets: [],
    GRID: { HORIZONTALS: [], VERTICALS: [] },
    gridlineCrossedX: -1,
    gridlneCrossedY: -1,
    CANVAS_RECT: {},
    select: null,
    octave:1,
    scaleToPlay: {},
    scales: null,
    midiInterface: null,
    midiSelect: null,
    gridSizeSelect: null,
    midiRange:[-1,4],
    toneRange:[0,6],

    init: function (systems, scales) {
        var self = this;
        this.midiInterface = new MidiInterface(function (msg) {
            self.addAudioOptions()
        });
        this.toneInterface = new ToneInterface();
        this.center = view.center;
        this.scales = scales
        this.systems = systems;
        this.addOptions();
        this.setGridSize();
        this.initializeGrid();
        this.initializePlanets();
    },


    setGridSize: function (newSize) {
        if (this.gridSizeSelect == undefined) this.gridSizeSelect = document.getElementById("gridSize");
        //console.log(this.gridSizeSelect);
        this.GRIDSIZE = this.gridSizeSelect.options[this.gridSizeSelect.selectedIndex].value;
    },

    resetGrid: function () {
        this.setGridSize();
        this.clearGrid();
        this.initializeGrid();
    },


    initializeGrid: function () {
        var c = document.getElementById("canvas");
        this.CANVAS_RECT = c.getBoundingClientRect();

        this.GRID.VERTICALS = [this.CANVAS_RECT.width];
        this.GRID.HORIZONTALS = [this.CANVAS_RECT.height];
        //create vertical lines
        var newX = 0;
        var convertedX = 0;
        var x = 1;
        this.octave = 0;
        do {
            newX = this.GRIDSIZE * x;
            convertedX = Math.floor(this.paperCoordinates(new Point(newX, 0)).x);
            var midiPitch = this.getPitch(x, "v", "midi");
            var tonePitch = this.getPitch(x, "v", "audio");
            var line = new GridLine(convertedX, 0, this.CANVAS_RECT.height, 0.2, midiPitch, tonePitch, "vertical");
            line.path = new Path.Line(
                new Point(newX, 0),
                new Point(newX, this.CANVAS_RECT.height)
            )
            line.text = new PointText(new Point(newX, this.GRIDSIZE));
            line.text.strokeColor = "#fff";
            line.text.fillColor = "#fff";
            line.text.opacity = 1;
            line.text.fontSize = 10;
            line.text.opacity = 0.3;
            line.text.fontWeight = 100;
            line.text.fontFamily = "sans-serif";
            line.text.justification = "center";

            var xrange = [0, this.CANVAS_RECT.width];
            var pan = this.convertRange(newX, xrange, [-1, 1]);
            line.string = this.toneInterface.makeString(pan, "V");
            this.GRID.VERTICALS[x] = line;
            x++;
        }
        while (this.GRIDSIZE * x < this.CANVAS_RECT.width);

        //create horizontal lines
        this.octave = 0;
        var newY = 0;
        var convertedY = 0;
        var y = 1;
        do {
            newY = this.GRIDSIZE * y;
            midiPitch = this.getPitch(y, "h", "midi");
            tonePitch = this.getPitch(y, "h", "audio");
            convertedY = Math.floor(this.paperCoordinates(new Point(0, newY)).y);
            var line = new GridLine(0, convertedY, this.CANVAS_RECT.width, 0.2, midiPitch, tonePitch, "horizontal");
            line.path = new Path.Line(
                new Point(0, newY),
                new Point(this.CANVAS_RECT.width, newY)
            );
            line.text = new PointText(new Point(this.GRIDSIZE, newY));
            line.text.strokeColor = "#fff";
            line.text.strokeColor = "#fff";
            line.text.fillColor = "#fff";
            line.text.opacity = 1;
            line.text.fontSize = 10;
            line.text.opacity = 0.3;
            line.text.fontWeight = 100;
            line.text.fontFamily = "sans-serif";
            line.text.justification = "center";

            line.string = this.toneInterface.makeString(0, "H");
            this.GRID.HORIZONTALS[y] = line;
            y++;
        }
        while (this.GRIDSIZE * y < this.CANVAS_RECT.height);
    },

    getPitch: function (lineNum, horizOrVert, midiOrAudio) {
        if (this.scaleToPlay.h == undefined) {
            this.scaleToPlay.h = this.scales[this.h_scaleSelect.options[this.h_scaleSelect.selectedIndex].value];
            this.scaleToPlay.v = this.scales[this.v_scaleSelect.options[this.v_scaleSelect.selectedIndex].value];
        };
        var scale = this.scaleToPlay[horizOrVert];
        //var octave = Math.floor(lineNum / scale.length);

        var numGridLines = (horizOrVert == "h") ? this.CANVAS_RECT.height / this.GRIDSIZE : this.CANVAS_RECT.width / this.GRIDSIZE;
        var octave = Math.floor(this.convertRange(lineNum, [0, numGridLines], [0, 8]));
        var pitch = scale[lineNum % scale.length] + "" + octave;
        return pitch
    },

    addOptions: function (systems) {
        this.select = document.getElementById("system");
        var self = this;
        this.select.addEventListener('change', function () {
            self.initializePlanets();
        }, false);
        //why not use push here?
        for (var system in this.systems) {
            this.select.options[this.select.options.length] = new Option(system, system);
        }

        this.h_scaleSelect = document.getElementById("scale_h");
        this.h_scaleSelect.addEventListener('change', function () {
            self.initializeScale("h");
        }, false);
        for (var scale in this.scales) {
            this.h_scaleSelect.options[this.h_scaleSelect.options.length] = new Option(scale, scale);
        };
        this.v_scaleSelect = document.getElementById("scale_v");
        this.v_scaleSelect.addEventListener('change', function () {
            self.initializeScale("v");
        }, false);
        for (var scale in this.scales) {
            this.v_scaleSelect.options[this.v_scaleSelect.options.length] = new Option(scale, scale);
        };

        this.gridSizeSelect = document.getElementById("gridSize");
        this.gridSizeSelect.addEventListener('change', function () {
            self.resetGrid();
        }, false);
        this.gridSizeSelect.value = 25;
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
        };
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
        //console.log("scale ::: " + this.scaleToPlay[whichScale]);
        this.clearGrid();
        this.initializeGrid();
    },
    clearGrid: function () {
        for (var i = 0; i < this.GRID.VERTICALS.length; i++) {
            var line = this.GRID.VERTICALS[i];
            if (line.path != undefined) {
                line.path.remove()
            }
            if (line.text != undefined) {
                line.text.remove()
            }
        }
        for (var i = 0; i < this.GRID.HORIZONTALS.length; i++) {
            var line = this.GRID.HORIZONTALS[i]
            if (line.path != undefined) {
                line.path.remove();
            }
            if (line.text != undefined) {
                line.text.remove()
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
            var radius = Math.max(Math.min(Math.pow(planet.mass, 1 / 3), 5), 2);
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
            var gridline = this.GRID.HORIZONTALS[gridlineCrossedY]
            this.setLinePlucked(gridline, planet, gridlineCrossedY, "V")
            //console.log("%chorizontal gridline crossed :: " + gridlineCrossedY, "background:" + planet.color);
            //make a midinote from the line properties
            this.makeNote(gridline, planet, "y", "V");
        }

    },
    LASTX: 0,
    LASTY: 0,
    checkGridCrossingX: function (planet) {
        var lineNum = -1
        var newX = Math.floor(planet.position.x);
        var planetRadius = Math.floor(planet.circle.bounds.width)/ 2;
        newX = Math.floor(newX - planetRadius);
        for (var i = 0; i < this.GRID.VERTICALS.length; i++) {
            if (newX == this.GRID.VERTICALS[i].x) {                   
                if (i != planet.lastCrossedLine_V) {
                    planet.lastCrossedLine_V = i;
                    lineNum = i;
                    break;
                }
            }
        }
        return lineNum;
    },
    checkGridCrossingY: function (planet) {
        var lineNum = -1;
        var newY = Math.floor(planet.position.y);
        var planetRadius = Math.floor(planet.circle.bounds.height) / 2;
        newY = Math.floor(newY - planetRadius);
        for (var i = 0; i < this.GRID.HORIZONTALS.length; i++) {
            if (newY == this.GRID.HORIZONTALS[i].y) {
                if (i != planet.lastCrossedLine_H) {
                    planet.lastCrossedLine_H = i;
                    lineNum = i;
                    break;
                }
            }
        }
        return lineNum;
    },
    makeNote: function (gridline: object, planet: object, whichVelocity: string, horizOrVert: string) {
        if (this.midiSelect.value == "webaudio") {
            //user has selected web audio
            this.makeToneNote(gridline, planet, whichVelocity, horizOrVert);
        } else {
            this.makeMidiNote(gridline, planet, whichVelocity, horizOrVert);
        }
    },

    makeMidiNote: function (gridline:object, planet:object, whichVelocity:string, horizOrVert:string) {
        //call midi functionality here;
        var planetVelocity = Math.abs(Math.floor(planet.velocity[whichVelocity]));
        var velocity = this.convertRange(planetVelocity, [10, 500], [50, 127]);
        var duration = planet.mass
        var channel = horizOrVert == "H" ? 1 : 2;
        this.midiInterface.playNote(gridline.midiNote, velocity, duration, channel)
    },

    //note -- for web audio every string should have its own synth
    makeToneNote: function (gridline: object, planet: object, whichVelocity: string, horizOrVert: string) {
        var xrange = [0, this.CANVAS_RECT.width];
        var pan = this.convertRange(planet.X, xrange, [-1, 1]);
        var planetVelocity = Math.abs(Math.floor(planet.velocity[whichVelocity]));;
        var velocity = this.convertRange(planetVelocity, [10, 500], [50, 127]);
        var pitch = gridline.webAudioNote;
        //this.toneInterface.playNote(pitch, velocity, 100, pan, horizOrVert);
        this.toneInterface.playString(gridline.string, pitch);
    },

    /*X_RANGE: [-150, 150],
    PAN_RANGE: [1, -1],
    getPlanetSoundPan: function (val) {
        return this.convertRange(val, this.X_RANGE, this.PAN_RANGE)
    },
    
    getPlanetSoundFrequency: function (val) {
        return this.pixelToFreq(val);
    },
    getPlanetSoundVolume: function (val) {
        return this.velocitytToDb(val - 50);
    },
    VELOCITY_RANGE: [0, 800],
    DB_RANGE: [-100, -99],
    velocitytToDb: function (val) {
        var newVol = this.convertRange(val, this.VELOCITY_RANGE, this.DB_RANGE);
        //failsafe so we don't blow out speakers
        if (newVol > this.DB_RANGE[1]) return this.DB_RANGE[1];
        return newVol;
    },
    PIXEL_RANGE: [-100, 100],
    FREQUENCY_RANGE: [4, 440],
    pixelToFreq: function (val) {
        var newFreq = this.convertRange(val, this.PIXEL_RANGE, this.FREQUENCY_RANGE);
        //failsafe
        if (newFreq > 1000) return 1000;
        return newFreq;
    },
    */
    convertRange: function (input:number, r1:number[], r2:number[]) {
        return (input - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
    },
    getPerceivedVelocity: function (planet) {
        var velX = Math.abs(planet.velocity.x);
        var velY = Math.abs(planet.velocity.y);
        if (velX > velY) {
            return velX
        } else {
            return velY
        }
    },
    updateRepresentation: function () {
        for (var i in this.planets) {
            this.updatePlanetRepresentation(this.planets[i]);
        }

        for (var i = 0; i < this.GRID.VERTICALS.length; i++) {
            this.updateGridLine(this.GRID.VERTICALS[i]);
        }
        for (var i in this.GRID.HORIZONTALS) {
            this.updateGridLine(this.GRID.HORIZONTALS[i]);
        }
    },
    updatePlanetRepresentation: function (planet) {
        planet.circle.position = this.paperCoordinates(planet.position);
        planet.path.add(this.paperCoordinates(planet.position));
        if (planet.path.segments.length > this.PATH_MAX_POINTS) {
            planet.path.removeSegments(0, 1);
        }
    },

    updateGridLine: function (line) {
        if (line.path != undefined) {
            if (line.plucked) {
                line.path.strokeColor = line.pluckedColor;
                line.path.opacity -= 0.03;
                
            } else {
                line.path.strokeColor = line.color;
                line.path.opacity = 0.15;
            }
        }
        if (line.text != undefined) {
            line.text.content = line.webAudioNote;
        }
    },
    T: 0,
    pluckedLines: [],
    timeouts:[],
    setLinePlucked: function (line, planet, lineNum, lineTypeProperty) {
        line.plucked = true;
        line.pluckedColor = planet.color;
        var lineTypeProperty = "lastCrossedLine_" + lineTypeProperty;
        planet[lineTypeProperty] = lineNum;
        this.pluckedLines.push[line];
        line.path.opacity = 1;
        var self = this;
        var t = setTimeout(function () { self.clearLinePlucked(line, planet, lineTypeProperty) }, 500);
        this.timeouts.push(t);

    },
    clearLinePlucked: function (line, planet, lineTypeProperty) {
        line.plucked = false;
        var timeout = this.timeouts.shift();
        clearTimeout(timeout);
        planet[lineTypeProperty] = -1;
    },

    paperCoordinates: function (point) {
        return view.center - point;
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
        if (delta > this.MAX_DELTA) delta = this.MAX_DELTA;
        for (var i = 0; i < this.STEPS; i++) {
            this.simulate(delta / this.STEPS);
        }
        this.updateRepresentation();
    }
}



const colors = [
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
}

var scales = {
    test_scale: ["C", "C", "C", "C"],
    c_major: Tonal.Scale.get("C major").notes,
    /*c_major_bebop: Tonal.Scale.get("C bebop").notes,
    c_major_pentatonic: Tonal.Scale.get("C pentatonic").notes,
    c_minor: Tonal.Scale.get("C minor").notes,
    d_major: Tonal.Scale.get("D major").notes,
    d_major_bebop: Tonal.Scale.get("D bebop").notes,
    d_major_pentatonic: Tonal.Scale.get("D pentatonic").notes,
    d_minor: Tonal.Scale.get("D minor").notes,
    e_major: Tonal.Scale.get("E major").notes,
    e_major_bebop: Tonal.Scale.get("E bebop").notes,
    e_major_pentatonic: Tonal.Scale.get("E pentatonic").notes,
    e_minor: Tonal.Scale.get("E minor").notes,
    f_major: Tonal.Scale.get("F major").notes,
    f_major_bebop: Tonal.Scale.get("F bebop").notes,
    f_major_pentatonic: Tonal.Scale.get("F pentatonic").notes,
    f_minor: Tonal.Scale.get("F minor").notes,
    g_major: Tonal.Scale.get("G major").notes,
    g_major_bebop: Tonal.Scale.get("G bebop").notes,
    g_major_pentatonic: Tonal.Scale.get("G pentatonic").notes,
    g_minor: Tonal.Scale.get("G minor").notes,
    a_major: Tonal.Scale.get("A major").notes,
    a_major_bebop: Tonal.Scale.get("A bebop").notes,
    a_major_pentatonic: Tonal.Scale.get("A pentatonic").notes,
    a_minor: Tonal.Scale.get("A minor").notes,
    b_major: Tonal.Scale.get("B major").notes,
    b_major_bebop: Tonal.Scale.get("B bebop").notes,
    b_major_pentatonic: Tonal.Scale.get("B pentatonic").notes,
    b_minor: Tonal.Scale.get("B minor").notes,
    chromatic: ["C", "C#", "D", "D#", "E", "F", "G", "G#", "A", "A#", "B"]*/
};

function getScales() {
    var allScales = Tonal.Scale.names();
    var notes = null;
    for (var i = 0; i < allScales.length; i++) {
        notes = Tonal.Scale.get("C " + allScales[i]).notes
        scaleName = "c-" + allScales[i].replace(/\s+/g, '-').toLowerCase();
        scales[scaleName] = notes;
    }
}
getScales();    


function getColor(colorNum) {
    if (colorNum == undefined) colorNum = Math.floor(Math.random() * colors.length);
    var clr = colors[colorNum];
    return clr;
}

var sim = new simulation();
sim.init(systems, scales);

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
};
document.getElementById("stopButton").onclick = stopAll;

