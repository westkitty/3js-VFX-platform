export type IndicatorPlanarShape = 'line' | 'zone' | 'cone' | 'ring' | 'rectangle';

export interface IndicatorOutlineConfig {
  shape: IndicatorPlanarShape;
  range: number;
  radius: number;
  angle: number;
  width: number;
}

export type IndicatorPhase = 'warning' | 'commit' | 'clear' | 'done';

export interface IndicatorPhaseState {
  phase: IndicatorPhase;
  elapsed: number;
}

export interface IndicatorPhaseAdvance {
  state: IndicatorPhaseState;
  opacity: number;
  enteredCommit: boolean;
  finished: boolean;
}

export function buildIndicatorLocalOutline(config: IndicatorOutlineConfig): Array<[number, number]> {
  const range = Math.max(0.1, config.range);
  const radius = Math.max(0.1, config.radius);
  const width = Math.max(0.05, config.width);

  if (config.shape === 'zone' || config.shape === 'ring') {
    const points: Array<[number, number]> = [];
    for (let index = 0; index < 48; index++) {
      const angle = (index / 48) * Math.PI * 2;
      points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
    }
    return points;
  }

  if (config.shape === 'cone') {
    const halfAngle = Math.max(0.05, Math.min(Math.PI * 0.95, config.angle)) * 0.5;
    const points: Array<[number, number]> = [[0, 0]];
    for (let index = 0; index <= 32; index++) {
      const angle = -halfAngle + (index / 32) * halfAngle * 2;
      points.push([Math.sin(angle) * range, Math.cos(angle) * range]);
    }
    return points;
  }

  const halfWidth = width * 0.5;
  return [
    [-halfWidth, 0],
    [-halfWidth, range],
    [halfWidth, range],
    [halfWidth, 0],
  ];
}

export function createIndicatorPhaseState(): IndicatorPhaseState {
  return { phase: 'warning', elapsed: 0 };
}

export function advanceIndicatorPhase(
  current: IndicatorPhaseState,
  dt: number,
  warningDuration: number,
  commitDuration: number,
  clearDuration: number = 0.2,
): IndicatorPhaseAdvance {
  let phase = current.phase;
  let elapsed = Math.max(0, current.elapsed);
  let remaining = Math.max(0, dt);
  let enteredCommit = false;

  const warning = Math.max(0, warningDuration);
  const commit = Math.max(0, commitDuration);
  const clear = Math.max(0, clearDuration);

  while (phase !== 'done') {
    const duration = phase === 'warning' ? warning : phase === 'commit' ? commit : clear;

    if (duration === 0) {
      if (phase === 'warning') {
        phase = 'commit';
        enteredCommit = true;
        elapsed = 0;
        continue;
      }
      if (phase === 'commit') {
        phase = 'clear';
        elapsed = 0;
        continue;
      }
      phase = 'done';
      elapsed = 0;
      break;
    }

    const untilTransition = Math.max(0, duration - elapsed);
    if (remaining < untilTransition) {
      elapsed += remaining;
      remaining = 0;
      break;
    }

    remaining -= untilTransition;
    elapsed = 0;

    if (phase === 'warning') {
      phase = 'commit';
      enteredCommit = true;
    } else if (phase === 'commit') {
      phase = 'clear';
    } else {
      phase = 'done';
      break;
    }

    if (remaining === 0) break;
  }

  const opacity = phase === 'warning'
    ? 0.9
    : phase === 'commit'
      ? 1
      : phase === 'clear' && clear > 0
        ? Math.max(0, 1 - elapsed / clear)
        : 0;

  return {
    state: { phase, elapsed },
    opacity,
    enteredCommit,
    finished: phase === 'done',
  };
}
