/**
 * UTILS
 */
export const lerp = (start: number, end: number, amt: number) =>
  (1 - amt) * start + amt * end;

export const map = (
  num: number,
  min1: number,
  max1: number,
  min2: number,
  max2: number,
) => ((num - min1) / (max1 - min1)) * (max2 - min2) + min2;

/**
 * EASING LIBRARY CONSTANTS & EQUATIONS
 */
const e = {
  s: 1.70158,
  q: 2.25,
  r: 1.525,
  u: 0.984375,
  v: 7.5625,
  w: 0.9375,
  x: 2.75,
  y: 2.625,
  z: 0.75,
};

export const Easing = {
  linear: (m: number) => m,
  Power1In: (m: number) => -Math.cos(m * (Math.PI / 2)) + 1,
  Power1Out: (m: number) => Math.sin(m * (Math.PI / 2)),
  Power1InOut: (m: number) => -0.5 * (Math.cos(Math.PI * m) - 1),
  Power2In: (m: number) => m * m,
  Power2Out: (m: number) => m * (2 - m),
  Power2InOut: (m: number) => (m < 0.5 ? 2 * m * m : -1 + (4 - 2 * m) * m),
  Power3In: (m: number) => m * m * m,
  Power3Out: (m: number) => --m * m * m + 1,
  Power3InOut: (m: number) =>
    m < 0.5 ? 4 * m * m * m : (m - 1) * (2 * m - 2) * (2 * m - 2) + 1,
  Power4In: (m: number) => m * m * m * m,
  Power4Out: (m: number) => 1 - --m * m * m * m,
  Power4InOut: (m: number) =>
    m < 0.5 ? 8 * m * m * m * m : 1 - 8 * --m * m * m * m,
  Power5In: (m: number) => m * m * m * m * m,
  Power5Out: (m: number) => 1 + --m * m * m * m * m,
  Power5InOut: (m: number) =>
    m < 0.5 ? 16 * m * m * m * m * m : 1 + 16 * --m * m * m * m * m,
  ExpoIn: (m: number) => (m === 0 ? 0 : Math.pow(2, 10 * (m - 1))),
  ExpoOut: (m: number) => (m === 1 ? 1 : -Math.pow(2, -10 * m) + 1),
  ExpoInOut: (m: number) => {
    if (m === 0) {
      return 0;
    }
    if (m === 1) {
      return 1;
    }
    if ((m /= 0.5) < 1) {
      return 0.5 * Math.pow(2, 10 * (m - 1));
    } else {
      return 0.5 * (-Math.pow(2, -10 * --m) + 2);
    }
  },
  CircIn: (m: number) => -(Math.sqrt(1 - m * m) - 1),
  CircOut: (m: number) => Math.sqrt(1 - Math.pow(m - 1, 2)),
  CircInOut: (m: number) => {
    if ((m /= 0.5) < 1) {
      return -0.5 * (Math.sqrt(1 - m * m) - 1);
    } else {
      return 0.5 * (Math.sqrt(1 - (m -= 2) * m) + 1);
    }
  },
  BackIn: (m: number) => m * m * ((e.s + 1) * m - e.s),
  BackOut: (m: number) => (m = m - 1) * m * ((e.s + 1) * m + e.s) + 1,
  BackInOut: (m: number) => {
    if ((m /= 0.5) < 1) {
      return 0.5 * (m * m * (((e.s *= e.r) + 1) * m - e.s));
    } else {
      return 0.5 * ((m -= 2) * m * (((e.s *= e.r) + 1) * m + e.s) + 2);
    }
  },
  Elastic: (m: number) =>
    -1 * Math.pow(4, -8 * m) * Math.sin(((m * 6 - 1) * (2 * Math.PI)) / 2) + 1,
  SwingFromTo: (m: number) =>
    (m /= 0.5) < 1
      ? 0.5 * (m * m * (((e.s *= e.r) + 1) * m - e.s))
      : 0.5 * ((m -= 2) * m * (((e.s *= e.r) + 1) * m + e.s) + 2),
  SwingFrom: (m: number) => m * m * ((e.s + 1) * m - e.s),
  SwingTo: (m: number) => (m -= 1) * m * ((e.s + 1) * m + e.s) + 1,
  Bounce: (m: number) => {
    if (m < 1 / e.x) {
      return e.v * m * m;
    } else if (m < 2 / e.x) {
      return e.v * (m -= 1.5 / e.x) * m + e.z;
    } else if (m < 2.5 / e.x) {
      return e.v * (m -= e.q / e.x) * m + e.w;
    } else {
      return e.v * (m -= e.y / e.x) * m + e.u;
    }
  },
  BounceOut: (m: number) => {
    if (m < 1 / e.x) {
      return e.v * m * m;
    } else if (m < 2 / e.x) {
      return e.v * (m -= 1.5 / e.x) * m + e.z;
    } else if (m < 2.5 / e.x) {
      return e.v * (m -= e.q / e.x) * m + e.w;
    } else {
      return e.v * (m -= e.y / e.x) * m + e.u;
    }
  },
  BouncePast: (m: number) => {
    if (m < 1 / e.x) {
      return e.v * m * m;
    } else if (m < 2 / e.x) {
      return 2 - (e.v * (m -= 1.5 / e.x) * m + e.z);
    } else if (m < 2.5 / e.x) {
      return 2 - (e.v * (m -= e.q / e.x) * m + e.w);
    } else {
      return 2 - (e.v * (m -= e.y / e.x) * m + e.u);
    }
  },
  FromTo: (m: number) => {
    if ((m /= 0.5) < 1) {
      return 0.5 * Math.pow(m, 4);
    } else {
      return -0.5 * ((m -= 2) * Math.pow(m, 3) - 2);
    }
  },
  From: (m: number) => Math.pow(m, 4),
  To: (m: number) => Math.pow(m, 0.25),
};
