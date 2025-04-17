// Declaration file to help TS/ESLint resolve types module
declare module './types' {
  export interface Point3D {
    x: number;
    y: number;
    z: number;
  }

  export interface Hand3D {
    position: Point3D;
    confidence: number;
    landmarks: Point3D[];
  }

  export interface Camera3D {
    position: Point3D;
    rotation: Point3D;
    fov: number;
  }
} 