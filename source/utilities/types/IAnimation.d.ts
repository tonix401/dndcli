/**
 * Interface representing an animation.
 */
export interface IAnimation {
  frames: string[][];
  frameTime: number;
  totalFrames?: number;
  frameWidth?: number;
  frameHeight?: number;
}
