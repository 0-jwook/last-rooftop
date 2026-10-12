import { LOGICAL_W, HORIZON_Y } from './constants';
import { lerp, lerpColor } from './colorMath';
import { PALETTE } from './palette';

interface TimeKeyframe {
  t: number;
  skyTop: string;
  skyHorizon: string;
  sunColor: string;
  ambientDarkness: number;
}

const KEYFRAMES: TimeKeyframe[] = [
  { t: 0.0, skyTop: PALETTE.nightSkyTop, skyHorizon: PALETTE.nightSkyHorizon, sunColor: PALETTE.moon, ambientDarkness: 1.0 },
  { t: 0.25, skyTop: PALETTE.dawnSkyTop, skyHorizon: PALETTE.dawnSkyHorizon, sunColor: PALETTE.sunDawn, ambientDarkness: 0.35 },
  { t: 0.35, skyTop: PALETTE.daySkyTop, skyHorizon: PALETTE.daySkyHorizon, sunColor: PALETTE.sunDay, ambientDarkness: 0.0 },
  { t: 0.6, skyTop: PALETTE.afternoonSkyTop, skyHorizon: PALETTE.afternoonSkyHorizon, sunColor: PALETTE.sunAfternoon, ambientDarkness: 0.0 },
  { t: 0.76, skyTop: PALETTE.sunsetSkyTop, skyHorizon: PALETTE.sunsetSkyHorizon, sunColor: PALETTE.sunSunset, ambientDarkness: 0.45 },
  { t: 0.88, skyTop: PALETTE.duskSkyTop, skyHorizon: PALETTE.duskSkyHorizon, sunColor: PALETTE.moon, ambientDarkness: 0.85 },
  { t: 1.0, skyTop: PALETTE.nightSkyTop, skyHorizon: PALETTE.nightSkyHorizon, sunColor: PALETTE.moon, ambientDarkness: 1.0 },
];

export interface TimeState {
  skyTop: string;
  skyHorizon: string;
  sunColor: string;
  ambientDarkness: number;
  sunMoonX: number;
  sunMoonY: number;
  isNight: boolean;
  isSun: boolean;
  shadowLength: number;
}

const DAY_START = 0.25;
const DAY_END = 0.78;

function sunMoonArc(t: number): { x: number; y: number } {
  const inDay = t >= DAY_START && t <= DAY_END;
  const progress = inDay
    ? (t - DAY_START) / (DAY_END - DAY_START)
    : ((t < DAY_START ? t + 1 : t) - DAY_END) / (1 - (DAY_END - DAY_START));
  const x = lerp(LOGICAL_W * 0.92, LOGICAL_W * 0.06, progress);
  const y = HORIZON_Y - Math.sin(Math.min(1, Math.max(0, progress)) * Math.PI) * 125;
  return { x, y };
}

export function getTimeOfDayState(t: number): TimeState {
  const tt = ((t % 1) + 1) % 1;
  let i = 0;
  while (i < KEYFRAMES.length - 1 && KEYFRAMES[i + 1].t < tt) i++;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[Math.min(i + 1, KEYFRAMES.length - 1)];
  const span = b.t - a.t || 1;
  const alpha = (tt - a.t) / span;

  const skyTop = lerpColor(a.skyTop, b.skyTop, alpha);
  const skyHorizon = lerpColor(a.skyHorizon, b.skyHorizon, alpha);
  const sunColor = lerpColor(a.sunColor, b.sunColor, alpha);
  const ambientDarkness = lerp(a.ambientDarkness, b.ambientDarkness, alpha);
  const { x: sunMoonX, y: sunMoonY } = sunMoonArc(tt);
  const elevation = 1 - Math.abs(sunMoonY - HORIZON_Y) / 125;
  const isNight = ambientDarkness > 0.5;

  return {
    skyTop,
    skyHorizon,
    sunColor,
    ambientDarkness,
    sunMoonX,
    sunMoonY,
    isNight,
    isSun: tt >= DAY_START && tt <= DAY_END,
    shadowLength: 1 - Math.max(0, elevation),
  };
}
