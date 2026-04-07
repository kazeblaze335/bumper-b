import * as THREE from "three";

export const LayoutEngines = {
  getLayout1: (i: number, positions: any[]) => ({
    x: positions[i].x,
    y: positions[i].y,
    z: positions[i].z,
    scale: positions[i].scale,
    rotX: 0,
    rotY: 0,
    isMasked: 0.0,
  }),

  getLayout2: (
    i: number,
    currentY: number,
    positions: any[],
    totalHeight: number,
    velocity: number,
  ) => {
    let y = -positions[i].rowOffset + currentY;
    let wrappedY = (y + totalHeight / 2) % totalHeight;
    if (wrappedY < 0) wrappedY += totalHeight;
    return {
      x: positions[i].x,
      y: wrappedY - totalHeight / 2,
      z: positions[i].z,
      scale: positions[i].scale,
      rotX: velocity * 0.2,
      rotY: 0,
      isMasked: 0.0,
    };
  },

  getLayout3: (
    i: number,
    currentX: number,
    sliderWidth: number,
    margin: number,
    totalWidth: number,
    velocity: number,
  ) => {
    let x = i * (sliderWidth + margin) + currentX;
    let wrappedX = (x + totalWidth / 2) % totalWidth;
    if (wrappedX < 0) wrappedX += totalWidth;
    return {
      x: wrappedX - totalWidth / 2,
      y: 0,
      z: Math.abs(wrappedX - totalWidth / 2) * -0.15,
      scale: THREE.MathUtils.lerp(1, 0.88, Math.abs(velocity)),
      rotX: velocity * 0.1,
      rotY: velocity * -0.4,
      isMasked: 0.0,
    };
  },

  getLayout4: (
    i: number,
    currentY: number,
    spacingY: number,
    totalHeight: number,
  ) => {
    let y = i * spacingY - currentY;
    let wrappedY = (y + totalHeight / 2) % totalHeight;
    if (wrappedY < 0) wrappedY += totalHeight;

    return {
      x: 0,
      y: wrappedY - totalHeight / 2,
      z: 2.5,
      scale: 0.4, // Elegant scaling for the 40vh white bar
      rotX: 0,
      rotY: 0,
      isMasked: 1.0,
    };
  },
};
