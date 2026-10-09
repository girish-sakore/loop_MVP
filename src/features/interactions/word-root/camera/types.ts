import type { MotionValue } from "framer-motion";

export interface CameraState {
  x: number;
  y: number;
  scale: number;
}

export interface CameraValues {
  boardX: MotionValue<number>;
  boardY: MotionValue<number>;
  boardScale: MotionValue<number>;
}

export interface CameraControls {
  panTo: (bx: number, by: number, immediate?: boolean) => void;
  animatePanTo: (bx: number, by: number, duration?: number) => void;
  restorePrevious: (duration?: number) => void;
  panBy: (dx: number, dy: number) => void;
  getCurrentCamera: () => CameraState;
}

export type CameraHookReturn = CameraValues & CameraControls;
