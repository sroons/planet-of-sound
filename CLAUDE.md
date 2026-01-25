# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Planet of Sound is an interactive web application that combines n-body orbital mechanics simulation with music generation. Planets orbiting in gravitational systems trigger musical notes when crossing grid lines, creating a sonification of orbital dynamics.

## Build and Run Commands

```bash
# Compile TypeScript
npx tsc

# Run development server (with auto-reload)
npm run dev

# Run production server
npm start
```

The application runs at `http://localhost:3000` and opens via `planets.html`.

## Architecture

### Core Components

- **planets.ts** - Main simulation controller handling physics calculations, animation frames, and UI events. Contains planet system configurations (figure_8, butterfly, dragonfly, etc.) and grid-crossing detection logic.

- **planetTone.ts** - Tone.js audio interface. Creates FM synthesizers for grid lines with panning based on grid position. Horizontal lines use triangle waves (metallic), vertical lines use sine waves (vibraphone-like).

- **planetMidi.ts** - WebMidi.js interface for sending MIDI messages to external hardware/software instruments.

- **gridLine.ts** - Data model representing grid lines with pitch, pan position, and line references.

- **planets.html** - Main UI with Fabric controls (dropdowns, sliders, toggles) and canvas element.

### Data Flow

1. User selects a planet system → `initializePlanets()` configures bodies with mass, position, velocity
2. Animation loop (`onFrame()`) calculates gravitational forces and updates positions
3. Grid-crossing detection triggers audio via `planetTone.ts` or MIDI via `planetMidi.ts`
4. Planet properties (mass, position) affect note volume and stereo pan

### Audio Design

Grid lines map to musical pitches using Tonal.js scales. The default scale is C-major. Lines symmetric about center share the same pitch (distance from center determines the scale degree).

Audio signal chain: `FMSynth → PanVol (per-line) → JCReverb (0.3 wet) → Volume (+3dB) → Limiter (-1dB) → Master Output`

The limiter prevents distortion when multiple notes play simultaneously. Per-axis volume controls allow independent level adjustment for horizontal and vertical grid lines.

## Key Patterns

- Planet systems are defined as arrays of objects with `m` (mass), `x`/`y` (position), `vx`/`vy` (velocity), `color`, and `waveType`
- Grid size is configurable (10-200 pixels) and affects pitch density
- Grid crossing detection compares previous and current positions to find all crossed lines between frames

## Presets System

User settings can be saved and recalled using the presets feature in the sidebar panel.

### Saved Settings

Presets store the following configuration:
- Planet configuration (system)
- Horizontal/Vertical scale
- Horizontal/Vertical grid size (line spacing)
- Horizontal/Vertical tone (synth preset)
- Horizontal/Vertical octave
- Horizontal/Vertical volume
- Master volume
- Randomize octave toggles
- Auto-zoom setting

### Storage

Presets are stored in browser localStorage under the key `planetTones_presets` as a JSON object where keys are preset names and values are settings objects.

### UI Controls

- **Preset dropdown** - Select from saved presets
- **Load button** - Apply selected preset settings
- **Delete button** - Remove selected preset
- **Name input** - Enter name for new preset
- **Save Preset button** - Save current settings with entered name

## External Dependencies

Audio/music libraries are loaded from CDN or bundled in `/dist/`:
- Tone.js (Web Audio synthesis)
- WebMidi.js (MIDI output)
- Tonal.js (music theory/scales)
- Paper.js (canvas graphics)
- Office UI Fabric JS (UI controls)
