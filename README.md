# Planet of Sound

An interactive web application that combines n-body orbital mechanics simulation with generative music. Planets orbiting in gravitational systems trigger musical notes when crossing grid lines, creating a unique sonification of orbital dynamics.

[Watch Demo Video](https://youtu.be/oT8z6MX4HhM)

## Features

- **N-Body Physics Simulation** - Realistic gravitational interactions between planets using configurable orbital systems (figure-8, butterfly, dragonfly, and more)
- **Musical Grid** - Horizontal and vertical grid lines map to musical pitches using customizable scales
- **Dual Audio Output** - Web Audio synthesis via Tone.js or MIDI output to external hardware/software
- **Independent Axis Control** - Separate scale, octave, tone preset, and volume for horizontal and vertical grid lines
- **Preset System** - Save and recall your favorite configurations
- **Auto-Zoom** - Automatically adjusts view to keep all planets visible

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/planet-of-sound.git
cd planet-of-sound

# Install dependencies
npm install

# Compile TypeScript
npx tsc

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Quick Start

1. Open the app in your browser
2. Click anywhere on the canvas to enable audio (required by browsers)
3. Click the hamburger menu (top-right) to open the control panel
4. Select a planet configuration to begin

## Controls

| Control | Description |
|---------|-------------|
| **Planet Configuration** | Choose from preset orbital systems |
| **Horizontal/Vertical Scale** | Musical scale for each axis (C major, pentatonic, etc.) |
| **Linespacing** | Grid density (smaller = more notes) |
| **Tone** | Synthesizer preset for each axis |
| **Octave** | Base octave for notes (0-8) |
| **Randomize Octave** | Adds octave variation to notes |
| **Volume** | Per-axis and master volume controls |
| **Auto-Zoom** | Keeps all planets in view |
| **MIDI Output** | Route notes to external MIDI devices |

## How It Works

1. **Physics Engine** - Planets move according to Newtonian gravity, with each body influencing all others
2. **Grid Detection** - The system tracks when planets cross grid lines between animation frames
3. **Note Triggering** - Each grid line corresponds to a pitch in the selected scale. Lines equidistant from center share the same note.
4. **Audio Synthesis** - Notes play through FM synthesizers with reverb, or output as MIDI messages

### Audio Signal Chain

```
FMSynth → PanVol (per-line) → JCReverb → Volume (+3dB) → Limiter (-1dB) → Output
```

## Tech Stack

- **Paper.js** - Canvas rendering and animation
- **Tone.js** - Web Audio synthesis
- **Tonal.js** - Music theory and scale calculations
- **WebMidi.js** - MIDI output support
- **TypeScript** - Type-safe development
- **Express** - Development server

## Project Structure

```
planet-of-sound/
├── planets.ts        # Main simulation and physics
├── planetTone.ts     # Tone.js audio interface
├── planetMidi.ts     # MIDI output interface
├── gridLine.ts       # Grid line data model
├── planets.html      # Main UI
├── dist/             # Compiled JavaScript
└── localhost.js      # Express server
```

## Acknowledgments

Original 3-body animation code developed and shared by [jbochi](http://jbochi.github.io/planets/).

## License

MIT License - feel free to use, modify, and distribute.
