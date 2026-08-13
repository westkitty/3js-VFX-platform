import { AbilityDefinition } from '../../types';

export const SAMPLE_ABILITIES: AbilityDefinition[] = [
  {
    id: 'sample_amber_orb', name: 'Amber Orb', school: 'pyromancy',
    description: 'Carries a bright amber orb along a line with a warm trail of motes.', iconName: 'Flame',
    targeting: { shape: 'line', range: 22, minRange: 1, surfacePolicy: 'project' },
    timing: { windup: 0.2, travelSpeed: 20, hold: 0.6, fade: 0.4, cooldown: 1.2 },
    modules: [
      { type: 'orb', params: { radius: 0.8, colorCore: '#ffaa00', colorOuter: '#ff5522' } },
      { type: 'particles', params: { count: 180, speed: 7, size: 1.2, color: '#ff8800' } },
      { type: 'decal', params: { decalType: 'golden_rune', radius: 4.5 } },
    ],
    feedback: { cameraShake: 0.2, flashIntensity: 0.4, lightColor: '#ff7700', lightRadius: 18 }, budget: { maxParticles: 300, dynamicLights: 2 },
  },
  {
    id: 'sample_solar_column', name: 'Solar Column', school: 'pyromancy',
    description: 'Builds a tall amber-white column over a selected zone with drifting motes.', iconName: 'Zap',
    targeting: { shape: 'zone', range: 18, radius: 5, surfacePolicy: 'project' },
    timing: { windup: 0.3, travelSpeed: 0, hold: 1.2, fade: 0.8, cooldown: 3 },
    modules: [
      { type: 'beam', params: { radius: 2.5, colorCore: '#ffffff', colorGlow: '#ff5500' } },
      { type: 'particles', params: { count: 350, speed: 9, size: 1.5, color: '#ffaa00' } },
    ],
    feedback: { cameraShake: 0.25, flashIntensity: 0.6, lightColor: '#ff6600', lightRadius: 25 }, budget: { maxParticles: 500, dynamicLights: 3 },
  },
  {
    id: 'sample_frost_trace', name: 'Glacial Frost Trace', school: 'cryomancy',
    description: 'Draws a crisp blue-white ribbon along a targeted line and leaves a frosted surface trace.', iconName: 'Snowflake',
    targeting: { shape: 'line', range: 25, minRange: 1, surfacePolicy: 'project' },
    timing: { windup: 0.15, travelSpeed: 28, hold: 0.5, fade: 0.5, cooldown: 1.5 },
    modules: [
      { type: 'ribbon', params: { width: 0.6, colorCore: '#ffffff', colorGlow: '#00ccff', noiseAmp: 0.2 } },
      { type: 'particles', params: { count: 120, speed: 4.5, size: 0.8, color: '#aaeeff' } },
      { type: 'decal', params: { decalType: 'frost', radius: 3.5 } },
    ],
    feedback: { cameraShake: 0.15, flashIntensity: 0.3, lightColor: '#00ddff', lightRadius: 15 }, budget: { maxParticles: 200, dynamicLights: 1 },
  },
  {
    id: 'sample_violet_cascade', name: 'Violet Cascade', school: 'stormcraft',
    description: 'Layers a violet ribbon, beam, and motes over a selected zone.', iconName: 'CloudLightning',
    targeting: { shape: 'zone', range: 20, radius: 4, surfacePolicy: 'project' },
    timing: { windup: 0.1, travelSpeed: 0, hold: 0.4, fade: 0.3, cooldown: 1.8 },
    modules: [
      { type: 'ribbon', params: { width: 0.8, colorCore: '#ffffff', colorGlow: '#8800ff', noiseAmp: 0.8 } },
      { type: 'beam', params: { radius: 1.2, colorCore: '#ffffff', colorGlow: '#4400ff' } },
      { type: 'particles', params: { count: 220, speed: 12, size: 1, color: '#cc66ff' } },
    ],
    feedback: { cameraShake: 0.2, flashIntensity: 0.6, lightColor: '#aa44ff', lightRadius: 22 }, budget: { maxParticles: 300, dynamicLights: 2 },
  },
  {
    id: 'sample_crystal_rise', name: 'Crystalline Rise', school: 'earth',
    description: 'Builds a teal crystal-themed surface pattern along a targeted line with motes.', iconName: 'Layers',
    targeting: { shape: 'line', range: 20, minRange: 1, surfacePolicy: 'project' },
    timing: { windup: 0.2, travelSpeed: 18, hold: 2, fade: 1, cooldown: 2.5 },
    modules: [
      { type: 'particles', params: { count: 160, speed: 5, size: 1, color: '#33ffaa' } },
      { type: 'decal', params: { decalType: 'crystal', radius: 4 } },
    ],
    feedback: { cameraShake: 0.15, flashIntensity: 0.2, lightColor: '#00ffaa', lightRadius: 16 }, budget: { maxParticles: 250, dynamicLights: 1 },
  },
];
