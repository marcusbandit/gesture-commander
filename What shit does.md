# Variable Flow Documentation

## HandTracking.tsx

### Interfaces
1. `HandTrackingProps`
   - Type: Empty interface
   - Used for: Component props typing
   - Example: `{}`

2. `HandInfo`
   - Type: Interface
   - Properties:
     - `isOpen`: boolean
     - `openConfidence`: number
     - `pointingDirection`: string
     - `coordinates`: { x: number, y: number }
     - `confidence`: number
     - `fingerStraightness`: { thumb, index, middle, ring, pinky: number }
     - `extendedFingers`: { thumb, index, middle, ring, pinky: boolean }
   - Example:
   ```typescript
   {
     isOpen: true,
     openConfidence: 0.95,
     pointingDirection: "right",
     coordinates: { x: 0.7, y: 0.5 },
     confidence: 0.98,
     fingerStraightness: {
       thumb: 0.9,
       index: 0.95,
       middle: 0.8,
       ring: 0.7,
       pinky: 0.6
     },
     extendedFingers: {
       thumb: true,
       index: true,
       middle: false,
       ring: false,
       pinky: false
     }
   }
   ```

3. `HandsState`
   - Type: Interface
   - Properties:
     - `left`: HandInfo
     - `right`: HandInfo
   - Example:
   ```typescript
   {
     left: { /* HandInfo example */ },
     right: { /* HandInfo example */ }
   }
   ```

4. `GestureState`
   - Type: Interface
   - Properties:
     - `activationFrames`: number
     - `deactivationFrames`: number
     - `isGestureControlActive`: boolean
     - `brightnessControlFrames`: number
     - `isBrightnessControl`: boolean
     - `initialY`: number | null
     - `initialX`: number | null
   - Example:
   ```typescript
   {
     activationFrames: 8,
     deactivationFrames: 0,
     isGestureControlActive: false,
     brightnessControlFrames: 0,
     isBrightnessControl: false,
     initialY: null,
     initialX: null
   }
   ```

### Constants
1. `INITIAL_HAND_INFO`
   - Type: HandInfo
   - Example: (Same as HandInfo example with all values set to initial state)

2. `INITIAL_HANDS_STATE`
   - Type: HandsState
   - Example: (Same as HandsState example with both hands set to INITIAL_HAND_INFO)

3. `INITIAL_GESTURE_STATE`
   - Type: GestureState
   - Example: (Same as GestureState example with all values set to initial state)

4. `FRAMES_TO_ACTIVATE`
   - Type: number
   - Value: 10
   - Example: `const FRAMES_TO_ACTIVATE = 10;`

5. `FRAMES_TO_DEACTIVATE`
   - Type: number
   - Value: 15
   - Example: `const FRAMES_TO_DEACTIVATE = 15;`

6. `FRAMES_TO_BRIGHTNESS`
   - Type: number
   - Value: 10
   - Example: `const FRAMES_TO_BRIGHTNESS = 10;`

### Component Variables
1. `webcamRef`
   - Type: useRef<Webcam>
   - Example: `const webcamRef = useRef<Webcam>(null);`

2. `canvasRef`
   - Type: useRef<HTMLCanvasElement>
   - Example: `const canvasRef = useRef<HTMLCanvasElement>(null);`

3. `handsInfo` and `setHandsInfo`
   - Type: [HandsState, React.Dispatch<HandsState>]
   - Example: `const [handsInfo, setHandsInfo] = useState<HandsState>(INITIAL_HANDS_STATE);`

4. `gestureState` and `setGestureState`
   - Type: [GestureState, React.Dispatch<GestureState>]
   - Example: `const [gestureState, setGestureState] = useState<GestureState>(INITIAL_GESTURE_STATE);`

5. `currentGestureState`
   - Type: useRef<GestureState>
   - Example: `const currentGestureState = useRef<GestureState>(INITIAL_GESTURE_STATE);`

### Finger Extension Variables
1. `fingerTips`
   - Type: number[]
   - Example: `const fingerTips = [8, 12, 16, 20];`

2. `fingerMids`
   - Type: number[]
   - Example: `const fingerMids = [7, 11, 15, 19];`

3. `fingerBases`
   - Type: number[]
   - Example: `const fingerBases = [5, 9, 13, 17];`

4. `thumbVec`
   - Type: { x: number, y: number, z: number }
   - Example:
   ```typescript
   const thumbVec = {
     x: landmarks[4].x - landmarks[2].x,
     y: landmarks[4].y - landmarks[2].y,
     z: landmarks[4].z - landmarks[2].z
   };
   ```

5. `palmVec`
   - Type: { x: number, y: number, z: number }
   - Example:
   ```typescript
   const palmVec = {
     x: landmarks[17].x - landmarks[1].x,
     y: landmarks[17].y - landmarks[1].y,
     z: landmarks[17].z - landmarks[1].z
   };
   ```

6. `thumbMag`
   - Type: number
   - Example: `const thumbMag = Math.sqrt(thumbVec.x * thumbVec.x + thumbVec.y * thumbVec.y + thumbVec.z * thumbVec.z);`

7. `palmMag`
   - Type: number
   - Example: `const palmMag = Math.sqrt(palmVec.x * palmVec.x + palmVec.y * palmVec.y + palmVec.z * palmVec.z);`

8. `dotProduct`
   - Type: number
   - Example: `const dotProduct = thumbVec.x * palmVec.x + thumbVec.y * palmVec.y + thumbVec.z * palmVec.z;`

9. `thumbAngle`
   - Type: number
   - Example: `const thumbAngle = Math.acos(dotProduct / (thumbMag * palmMag));`

10. `thumbExtended`
    - Type: boolean
    - Example: `const thumbExtended = thumbAngle > Math.PI / 4;`

11. `fingerStates`
    - Type: boolean[]
    - Example: `const fingerStates = fingerTips.map((tip, i) => { /* ... */ });`

12. `tipPos`, `midPos`, `basePos`
    - Type: { x: number, y: number, z: number }
    - Example:
    ```typescript
    const tipPos = landmarks[tip];
    const midPos = landmarks[fingerMids[i]];
    const basePos = landmarks[fingerBases[i]];
    ```

13. `baseToMid`, `midToTip`
    - Type: { x: number, y: number, z: number }
    - Example:
    ```typescript
    const baseToMid = {
      x: midPos.x - basePos.x,
      y: midPos.y - basePos.y,
      z: midPos.z - basePos.z
    };
    const midToTip = {
      x: tipPos.x - midPos.x,
      y: tipPos.y - midPos.y,
      z: tipPos.z - midPos.z
    };
    ```

14. `baseMidMag`, `midTipMag`
    - Type: number
    - Example:
    ```typescript
    const baseMidMag = Math.sqrt(baseToMid.x * baseToMid.x + baseToMid.y * baseToMid.y + baseToMid.z * baseToMid.z);
    const midTipMag = Math.sqrt(midToTip.x * midToTip.x + midToTip.y * midToTip.y + midToTip.z * midToTip.z);
    ```

15. `fingerDot`
    - Type: number
    - Example: `const fingerDot = baseToMid.x * midToTip.x + baseToMid.y * midToTip.y + baseToMid.z * midToTip.z;`

16. `fingerAngle`
    - Type: number
    - Example: `const fingerAngle = Math.acos(fingerDot / (baseMidMag * midTipMag));`

17. `extendedFingers`
    - Type: boolean[]
    - Example: `const extendedFingers = [...fingerStates, thumbExtended];`

18. `openConfidence`
    - Type: number
    - Example: `const openConfidence = extendedFingers.filter(Boolean).length / 5;`

19. `isFullyOpen`
    - Type: boolean
    - Example: `const isFullyOpen = openConfidence === 1;`

### Finger Straightness Variables
1. `base`, `tip`
    - Type: { x: number, y: number, z: number }
    - Example:
    ```typescript
    const base = landmarks[fingerPoints[0]];
    const tip = landmarks[fingerPoints[fingerPoints.length - 1]];
    ```

2. `lineVector`
    - Type: { x: number, y: number, z: number }
    - Example:
    ```typescript
    const lineVector = {
      x: tip.x - base.x,
      y: tip.y - base.y,
      z: tip.z - base.z
    };
    ```

3. `lineLength`
    - Type: number
    - Example: `const lineLength = Math.sqrt(lineVector.x * lineVector.x + lineVector.y * lineVector.y + lineVector.z * lineVector.z);`

4. `normalizedLine`
    - Type: { x: number, y: number, z: number }
    - Example:
    ```typescript
    const normalizedLine = {
      x: lineVector.x / lineLength,
      y: lineVector.y / lineLength,
      z: lineVector.z / lineLength
    };
    ```

5. `point`
    - Type: { x: number, y: number, z: number }
    - Example: `const point = landmarks[fingerPoints[i]];`

6. `pointVector`
    - Type: { x: number, y: number, z: number }
    - Example:
    ```typescript
    const pointVector = {
      x: point.x - base.x,
      y: point.y - base.y,
      z: point.z - base.z
    };
    ```

7. `projection`
    - Type: number
    - Example: `const projection = pointVector.x * normalizedLine.x + pointVector.y * normalizedLine.y + pointVector.z * normalizedLine.z;`

8. `projectedPoint`
    - Type: { x: number, y: number, z: number }
    - Example:
    ```typescript
    const projectedPoint = {
      x: base.x + normalizedLine.x * projection,
      y: base.y + normalizedLine.y * projection,
      z: base.z + normalizedLine.z * projection
    };
    ```

9. `deviation`
    - Type: number
    - Example: `const deviation = Math.sqrt(Math.pow(point.x - projectedPoint.x, 2) + Math.pow(point.y - projectedPoint.y, 2) + Math.pow(point.z - projectedPoint.z, 2));`

10. `maxDeviation`
    - Type: number
    - Example: `const maxDeviation = lineLength * 0.5;`

11. `straightness`
    - Type: number
    - Example: `const straightness = Math.max(0, 1 - (totalDeviation / maxDeviation));`

### Hand Analysis Variables
1. `indexTip`, `indexBase`
    - Type: { x: number, y: number, z: number }
    - Example:
    ```typescript
    const indexTip = landmarks[8];
    const indexBase = landmarks[5];
    ```

2. `pointingAngle`
    - Type: number
    - Example: `const pointingAngle = Math.atan2(indexTip.y - indexBase.y, indexTip.x - indexBase.x) * (180 / Math.PI);`

3. `normalizedAngle`
    - Type: number
    - Example: `const normalizedAngle = (pointingAngle + 360) % 360;`

4. `fingerStraightness`
    - Type: { thumb, index, middle, ring, pinky: number }
    - Example:
    ```typescript
    const fingerStraightness = {
      thumb: calculateFingerStraightness(landmarks, [1, 2, 3, 4]),
      index: calculateFingerStraightness(landmarks, [5, 6, 7, 8]),
      middle: calculateFingerStraightness(landmarks, [9, 10, 11, 12]),
      ring: calculateFingerStraightness(landmarks, [13, 14, 15, 16]),
      pinky: calculateFingerStraightness(landmarks, [17, 18, 19, 20])
    };
    ```

5. `STRAIGHTNESS_THRESHOLD`
    - Type: number
    - Value: 0.6
    - Example: `const STRAIGHTNESS_THRESHOLD = 0.6;`

6. `rawStates`
    - Type: { thumb, index, middle, ring, pinky: boolean }
    - Example:
    ```typescript
    const rawStates = {
      thumb: fingerStraightness.thumb > STRAIGHTNESS_THRESHOLD,
      index: fingerStraightness.index > STRAIGHTNESS_THRESHOLD,
      middle: fingerStraightness.middle > STRAIGHTNESS_THRESHOLD,
      ring: fingerStraightness.ring > STRAIGHTNESS_THRESHOLD,
      pinky: fingerStraightness.pinky > STRAIGHTNESS_THRESHOLD
    };
    ```

7. `activeFingers`
    - Type: { thumb, index, middle, ring, pinky: boolean }
    - Example:
    ```typescript
    const activeFingers = {
      thumb: rawStates.thumb,
      index: rawStates.index,
      middle: rawStates.middle,
      ring: rawStates.ring,
      pinky: rawStates.pinky
    };
    ```

### MediaPipe Variables
1. `hands`
    - Type: Hands
    - Example: `const hands = new Hands({ /* options */ });`

2. `canvas`, `video`, `ctx`
    - Types: HTMLCanvasElement, HTMLVideoElement, CanvasRenderingContext2D
    - Example:
    ```typescript
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;
    const ctx = canvas.getContext('2d');
    ```

3. `dpr`
    - Type: number
    - Example: `const dpr = window.devicePixelRatio || 1;`

4. `displayWidth`, `displayHeight`
    - Type: number
    - Example:
    ```typescript
    const displayWidth = video.videoWidth;
    const displayHeight = video.videoHeight;
    ```

5. `newHandsInfo`
    - Type: HandsState
    - Example:
    ```typescript
    const newHandsInfo: HandsState = {
      left: { ...INITIAL_HAND_INFO },
      right: { ...INITIAL_HAND_INFO }
    };
    ```

6. `seenLabels`
    - Type: Record<string, boolean>
    - Example: `const seenLabels: Record<string, boolean> = {};`

7. `handedness`
    - Type: { label: string, score: number }
    - Example: `const handedness = results.multiHandedness[index];`

8. `label`
    - Type: string
    - Example: `const label = handedness.label.toLowerCase();`

9. `mirroredLandmarks`
    - Type: Array<{ x: number, y: number, z: number }>
    - Example: `const mirroredLandmarks = landmarks.map(landmark => ({ ...landmark, x: 1 - landmark.x }));`

10. `isUserRight`
    - Type: boolean
    - Example: `const isUserRight = handedness.label.toLowerCase() === 'left';`

11. `w`, `h`
    - Type: number
    - Example:
    ```typescript
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ```

12. `px`, `py`
    - Type: number
    - Example:
    ```typescript
    const px = x * w;
    const py = y * h;
    ```

### Drawing Variables
1. `thumbLandmarks`, `thumbConnections`
    - Types: number[], number[][]
    - Example:
    ```typescript
    const thumbLandmarks = [1, 2, 3, 4];
    const thumbConnections = [[1, 2], [2, 3], [3, 4]];
    ```

2. `indexLandmarks`, `indexConnections`
    - Types: number[], number[][]
    - Example:
    ```typescript
    const indexLandmarks = [5, 6, 7, 8];
    const indexConnections = [[5, 6], [6, 7], [7, 8]];
    ```

3. `lineLength`
    - Type: number
    - Example: `const lineLength = displayHeight * 0.8;`

4. `bottomOffset`
    - Type: number
    - Example: `const bottomOffset = (displayHeight - lineLength) / 2;`

### Brightness Control Variables
1. `isPointingVertical`
    - Type: boolean
    - Example: `const isPointingVertical = pointingDirection === 'up' || pointingDirection === 'down';`

2. `isPointingHorizontal`
    - Type: boolean
    - Example: `const isPointingHorizontal = pointingDirection.includes('left') || pointingDirection.includes('right');`

3. `isPinkyDown`
    - Type: boolean
    - Example: `const isPinkyDown = !activeFingers.pinky && activeFingers.index;`

4. `isActivationGesture`
    - Type: boolean
    - Example: `const isActivationGesture = activeFingers.index && activeFingers.pinky && !activeFingers.middle && !activeFingers.ring && !activeFingers.thumb;`

5. `shouldDeactivate`
    - Type: boolean
    - Example: `const shouldDeactivate = !results.multiHandLandmarks || results.multiHandLandmarks.length === 0 || (isGestureControlActive && (activeFingers.middle || activeFingers.ring || activeFingers.thumb || !Object.values(activeFingers).some(active => active)));`

6. `newDeactivationFrames`
    - Type: number
    - Example: `const newDeactivationFrames = deactivationFrames + 1;`

7. `newBrightnessFrames`
    - Type: number
    - Example: `const newBrightnessFrames = brightnessControlFrames + 1;`

8. `newFrames`
    - Type: number
    - Example: `const newFrames = activationFrames + 1;`

### Drawing Function Variables
1. `drawConnectors` parameters:
   - `ctx`: CanvasRenderingContext2D
   - `landmarks`: Array<{ x: number, y: number, z: number }>
   - `connections`: number[][]
   - `style`: { color: string, lineWidth: number }
   - Example:
   ```typescript
   const drawConnectors = (
     ctx: CanvasRenderingContext2D,
     landmarks: any,
     connections: any,
     style: { color: string; lineWidth: number }
   ) => {
     // Implementation
   };
   ```

## GestureDisplay.tsx

### Props
1. `handsInfo`
   - Type: HandsState
   - Example: (Same as HandTracking.tsx handsInfo example)

2. `controlState`
   - Type: { activationFrames, isGestureControlActive, brightnessControlFrames, isBrightnessControl }
   - Example:
   ```typescript
   controlState = {
     activationFrames: 8,
     isGestureControlActive: false,
     brightnessControlFrames: 0,
     isBrightnessControl: false
   }
   ```

3. `onCooldownComplete`
   - Type: () => void
   - Example:
   ```typescript
   onCooldownComplete = () => {
     setGestureState(INITIAL_GESTURE_STATE);
     currentGestureState.current = INITIAL_GESTURE_STATE;
   }
   ```

### Component Variables
1. `isModesEnabled`
   - Type: boolean
   - Example: `const [isModesEnabled, setIsModesEnabled] = useState(true);`

2. `barRef`
   - Type: useRef<HTMLDivElement>
   - Example: `const barRef = useRef<HTMLDivElement>(null);`

3. `width`
   - Type: string
   - Example: `const width = (e.target as HTMLElement).style.width;`

4. `newEnabled`
   - Type: boolean
   - Example: `const newEnabled = width === '100%';`

5. `bar`
   - Type: HTMLDivElement
   - Example: `const bar = barRef.current;`

6. `handConfidence`
   - Type: number
   - Example: `const handConfidence = Math.max(handInfo.confidence, 0);` 