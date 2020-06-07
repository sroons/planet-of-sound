var simulation = function () {}

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

    init: function (systems, center) {
        this.center = center;
        this.systems = systems;
        this.addOptions();
        this.initializeGrid();
        this.initializePlanets();

    },

    drawGrid: function () {
        /* //get context
        var c = document.getElementById("canvas");
        var ctx = c.getContext('2d');
        ctx.strokeStyle = "#DDDDDD";
        ctx.lineWidth=0.3;
        ctx.beginPath();
        //draw vertical lines
        var newX = 0;
        var x=1;
        do{
            newX = this.GRIDSIZE * x;
            ctx.moveTo(newX, 0);
            ctx.lineTo(newX, c.height);
            x++
        }
        while(this.GRIDSIZE * x < c.width);

        //draw horizontal lines
        var newY = 0;
        var y=1;
        do{
            newY = this.GRIDSIZE * y;
            ctx.moveTo(0, newY);
            ctx.lineTo(0, c.width);
            y++;
        }
        while(this.GRIDSIZE * y < c.height);

        ctx.stroke(); */

        var c = document.getElementById("canvas");
        var ctx = c.getContext('2d');
        for (var x = this.GRIDSIZE; x < c.width; x = x + this.GRIDSIZE) {
            var line = this.GRID.VERTICALS[x];
            line.path.strokeColor = (line.plucked ? "red" : line.color);
        };

        for (var y = this.GRIDSIZE; y < c.height; y = y + this.GRIDSIZE) {
            var line = this.GRID.HORIZONTALS[y];
            line.path.strokeColor = (line.plucked ? "red" : line.color);
        }
    },

    initializeGrid: function () {
        var c = document.getElementById("canvas");
        this.GRID = {};
        this.GRID.VERTICALS = [c.width];
        this.GRID.HORIZONTALS = [c.height];
        //create vertical lines
        var newX = 0;
        var x = 1;
        do {
            newX = this.GRIDSIZE * x;
            this.GRID.VERTICALS[newX] = {
                x: newX,
                width: 0.2,
                height: c.height,
                note: x,
                plucked: false,
                color: "#666",
                path: new Path.Line(
                    new Point(newX, 0),
                    new Point(newX, c.height)
                )
            };
            x++;
        }
        while (this.GRIDSIZE * x < c.width);

        //create horizontal lines
        var newY = 0;
        var y = 1;
        do {
            newY = this.GRIDSIZE * y;
            this.GRID.HORIZONTALS[newY] = {
                y: newY,
                width: c.width,
                height: 0.2,
                note: y,
                plucked: false,
                color: "#666",
                path: new Path.Line(
                    new Point(0, newY),
                    new Point(c.width, newY)
                )
            };
            y++;
        }
        while (this.GRIDSIZE * y < c.height);

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
                waveType: planets[i].soundWave
                //add a property for midi channel
            };
            this.planets.push(planet);
        }
        this.draw();
    },
    clearPlanets: function () {
        for (var i in this.planets) {
            this.planets[i].circle.remove();
            this.planets[i].path.remove();
            this.planets[i].tone.stop();
        }
    },
    draw: function () {
        var reverb = new Tone.JCReverb(0.75).toMaster();
        for (i in this.planets) {
            var planet = this.planets[i];
            var radius = Math.max(Math.min(Math.pow(planet.mass, 1 / 3), 5), 2);
            planet.circle = new Path.Circle(this.paperCoordinates(planet.position), radius);
            planet.circle.strokeColor = planet.color;
            planet.circle.fillColor = planet.color;

            planet.path = new Path();
            planet.path.strokeColor = planet.color;
            planet.path.add(new Point(this.paperCoordinates(planet.position)));

            planet.panner = new Tone.Panner(1);
            planet.tone = new Tone.Oscillator({
                "frequency": 440,
                "volume": -40,
                "type": planet.waveType
            }).chain(planet.panner, reverb).start();
            this.drawGrid()
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
            //sample planet structure
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            //VM16:149 ===> mass=200
            //VM16:149 ===> position={ x: 15.08242, y: 158.04173 }
            //VM16:149 ===> velocity={ x: -2.96926, y: 9.48738 }
            //VM16:149 ===> color=#ccc
            //VM16:149 ===> waveType=sine2
            //===>midiChannel
            //VM16:149 ===> circle=Path @2
            //VM16:149 ===> path=Path @3
            //VM16:149 ===> panner=Panner
            //VM16:149 ===> tone=Oscillator

            planet.position = positions[i];
            this.checkForMidiNote(planet);
            planet.tone.frequency.value = this.getPlanetSoundFrequency(positions[i].y);
            //planet.tone.volume.value = this.getPlanetSoundVolume(positions[i].x);
            planet.tone.volume.value = this.getPlanetSoundVolume(this.getPerceivedVelocity(planet));
            planet.panner.value = this.getPlanetSoundPan(positions[i].x);
            //console.log(planet.panner.value )
        }
    },
    checkForMidiNote: function (planet) {
        var gridlineCrossedX = this.checkGridCrossingX(planet.position);
        if (gridlineCrossedX) {
            gridlineCrossedX.item.strokeColor = "red";
            //make a midi note from the line properties
            //color the line red
        }
        var gridlineCrossedY = this.checkGridCrossingY(planet.position);
        if (gridlineCrossedY) {
            //console.log("gridline crossed :: y " + gridlineCrossedY)
            gridlineCrossedY.strokeColor = "red";
            //make a midinote from the line properties
            //color the line red
        }

    },
    LASTX: 0,
    LASTY: 0,
    checkGridCrossingX: function (positions) {
        /*         for (var x = this.GRIDSIZE; x < this.GRID.VERTICALS.length; x = x + this.GRIDSIZE) {
                    var line = this.GRID.VERTICALS[x];
                    var path = line.path;
                    path.strokeColor = line.color;
                    var hit = path.hitTest(new Point(positions.x, positions.y));
                    if (hit) return hit;
                } */
        return false;
    },
    checkGridCrossingY: function (positions) {
        /*         var roundedY = Math.floor(positions.y);
                if (roundedY % this.GRIDSIZE == 0 && roundedY != this.LASTY) {
                    this.LASTY = roundedY;
                    return roundedY;
                }
                return false; */
        /*     for (var y = this.GRIDSIZE; y < this.GRID.HORIZONTALS.length; y = y + this.GRIDSIZE) {
                var line = this.GRID.HORIZONTALS[y];
                var path = line.path
                path.strokeColor = line.color;
                var hit = path.hitTest(new Point(positions.x, positions.y))
                if (hit) return hit;
            } */
        return false;
    },
    X_RANGE: [-150, 150],
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
    DB_RANGE: [-35, 0],
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
        if (newFreq > 10000) return 10000;
        return newFreq;
    },

    convertRange: function (input, r1, r2) {
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
    },
    updatePlanetRepresentation: function (planet) {
        planet.circle.position = this.paperCoordinates(planet.position);
        planet.path.add(this.paperCoordinates(planet.position));
        if (planet.path.segments.length > this.PATH_MAX_POINTS) {
            planet.path.removeSegments(0, 1);
        }
    },
    paperCoordinates: function (point) {
        if (this.center === undefined) {
            return view.center - point;
        } else {
            return view.center - this.planets[this.center].position + point;
        }
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
    onFrame: function (event) {
        var delta = event.delta;
        if (delta > this.MAX_DELTA) delta = this.MAX_DELTA;
        for (var i = 0; i < this.STEPS; i++) {
            this.simulate(delta / this.STEPS);
        }
        this.updateRepresentation();
    }
}

function three_body(p1, p2) {
    return [{
            mass: 100,
            x: -100,
            y: 0,
            velX: 100 * p1,
            velY: 100 * p2,
            color: "#ccc",
            soundWave: "sine2"
        },
        {
            mass: 100,
            x: 100,
            y: 0,
            velX: 100 * p1,
            velY: 100 * p2,
            color: "#cc0",
            soundWave: "sine4"
        },
        {
            mass: 100,
            x: 0,
            y: 0,
            velX: -200 * p1,
            velY: -200 * p2,
            color: "#c00",
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
            velY: 0,
            color: "#ccc",
            soundWave: "sine2"
        },
        {
            mass: 10,
            x: 160,
            y: 0,
            velX: 0,
            velY: 120,
            color: "#cc0",
            soundWave: "sine4"
        },

    ],
    sun_planet_moon: [{
            mass: 200,
            x: 0,
            y: 0,
            velX: 0,
            velY: 0,
            color: "#ccc",
            soundWave: "sine2"
        },
        {
            mass: 10,
            x: 160,
            y: 0,
            velX: 0,
            velY: 120,
            color: "#cc0",
            soundWave: "sine4"
        },
        {
            mass: 0.001,
            x: 140,
            y: 0,
            velX: 0,
            velY: 53,
            color: "#c00",
            soundWave: "sine6"
        }
    ],

    four_star_ballet: [{
            mass: 120,
            x: -100,
            y: 100,
            velX: -50,
            velY: -50,
            color: "#ccc",
            soundWave: "sine2"
        },
        {
            mass: 120,
            x: 100,
            y: 100,
            velX: -50,
            velY: 50,
            color: "#cc0",
            soundWave: "sine4"
        },
        {
            mass: 120,
            x: 100,
            y: -100,
            velX: 50,
            velY: 50,
            color: "#c00",
            soundWave: "sine6"
        },
        {
            mass: 120,
            x: -100,
            y: -100,
            velX: 50,
            velY: -50,
            color: "#0cc",
            soundWave: "sine8"
        }
    ],

    double_double: [{
            mass: 60,
            x: -115,
            y: -3,
            velX: 0,
            velY: -155,
            color: "#ccc",
            soundWave: "sine2"
        },
        {
            mass: 70,
            x: 102,
            y: 0,
            velX: 1,
            velY: 150,
            color: "#cc0",
            soundWave: "sine4"
        },
        {
            mass: 55,
            x: -77,
            y: -2,
            velX: -1,
            velY: 42,
            color: "#c00",
            soundWave: "sine6"
        },
        {
            mass: 62,
            x: 135,
            y: 0,
            velX: -1,
            velY: -52,
            color: "#0cc",
            soundWave: "sine8"
        }
    ],

    sun_planet_comet: [{
            mass: 200,
            x: 0,
            y: 0,
            velX: 0,
            velY: 0,
            color: "#ccc",
            soundWave: "sine2"
        },
        {
            mass: 1,
            x: 150,
            y: 0,
            velX: 0,
            velY: 120,
            color: "#cc0",
            soundWave: "sine4"
        },
        {
            mass: 0.001,
            x: -220,
            y: 130,
            velX: -15,
            velY: -28,
            color: "#c00",
            soundWave: "sine6"
        }
    ],

    ellipses: [{
            mass: 250,
            x: -200,
            y: 0,
            velX: 0,
            velY: 0,
            color: "#ccc",
            soundWave: "sine2"
        },
        {
            mass: 0.001,
            x: -115,
            y: 0,
            velX: 0,
            velY: 151,
            color: "#cc0",
            soundWave: "sine4"
        },
        {
            mass: 0.001,
            x: 50,
            y: 0,
            velX: 0,
            velY: 60,
            color: "#c00",
            soundWave: "sine6"
        },
        {
            mass: 0.001,
            x: 220,
            y: 0,
            velX: 0,
            velY: 37,
            color: "#0cc",
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
            color: "#ccc",
            soundWave: "sine2"
        },
        {
            mass: 100,
            x: 50,
            y: -64.7584,
            velX: -50.5328,
            velY: 46.96663,
            color: "#cc0",
            soundWave: "sine4"
        },
        {
            mass: 100,
            x: 50,
            y: 64.7584,
            velX: 50.5328,
            velY: 46.96663,
            color: "c00",
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

var sim = new simulation();
sim.init(systems);

function onFrame(event) {
    sim.onFrame(event);
}

function stopAll() {
    sim.clearPlanets()
}