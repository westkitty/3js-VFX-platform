import { AbilityDefinition } from '../../types';

export const COSMIC_ABILITIES: AbilityDefinition[] = [
  {
    id: 'void_singularity', name: 'Void Singularity', school: 'void',
    description: 'Creates a gravitational rift that bends light, pulls particles inward, and implodes into a cosmic blast.', iconName: 'Disc',
    targeting: { shape: 'zone', range: 16, radius: 6.0, surfacePolicy: 'project' },
    timing: { windup: 0.4, travelSpeed: 0, hold: 1.5, fade: 0.6, cooldown: 4.0 },
    modules: [
      { type: 'orb', params: { radius: 2.0, colorCore: '#000000', colorOuter: '#bb00ff' } },
      { type: 'shockwave', params: { radius: 9.0, colorPrimary: '#9900ff', colorSecondary: '#000000' } },
      { type: 'particles', params: { count: 400, speed: -6.0, size: 1.2, color: '#dd33ff' } },
      { type: 'decal', params: { decalType: 'void_scar', radius: 6.0 } },
    ],
    feedback: { cameraShake: 0.5, flashIntensity: 0.7, lightColor: '#8800cc', lightRadius: 20 }, budget: { maxParticles: 600, dynamicLights: 2 },
  },
  {
    id: 'starsilk_bloom', name: 'Starsilk Line Bloom', school: 'starsilk',
    description: 'Weaves ethereal stellar threads across terrain in a silk ribbon pattern that sparkles with cosmic motes.', iconName: 'Sparkles',
    targeting: { shape: 'path', range: 30, surfacePolicy: 'project' },
    timing: { windup: 0.1, travelSpeed: 22.0, hold: 1.0, fade: 0.7, cooldown: 2.0 },
    modules: [
      { type: 'ribbon', params: { width: 0.8, colorCore: '#ffffff', colorGlow: '#ffaaee', noiseAmp: 0.15 } },
      { type: 'particles', params: { count: 250, speed: 3.0, size: 0.9, color: '#ffccff' } },
      { type: 'decal', params: { decalType: 'golden_rune', radius: 3.0 } },
    ],
    feedback: { cameraShake: 0.2, flashIntensity: 0.5, lightColor: '#ff88dd', lightRadius: 18 }, budget: { maxParticles: 350, dynamicLights: 2 },
  },
];
