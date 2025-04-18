import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import './HandTracking.css';
import GestureDisplay from './GestureDisplay';

interface HandTrackingProps {}

interface HandInfo {
  isOpen: boolean;
  openConfidence: number;
  pointingDirection: string;
  coordinates: {
    x: number;
    y: number;
  };
  confidence: number;
  fingerStraightness: {
    thumb: number;
    index: number;
    middle: number;
    ring: number;
    pinky: number;
  };
  activeFingers: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  };
}

interface HandsState {
  left: HandInfo;
  right: HandInfo;
}

// Add gesture tracking state
interface GestureState {
  activationFrames: number;
  deactivationFrames: number;
  isControlActive: boolean;
  brightnessControlFrames: number;
  isBrightnessControl: boolean;
  initialY: number | null;
  initialX: number | null;
}

const INITIAL_HAND_INFO: HandInfo = {
  isOpen: false,
  openConfidence: 0,
  pointingDirection: 'none',
  coordinates: { x: 0, y: 0 },
  confidence: 0,
  fingerStraightness: {
    thumb: 0,
    index: 0,
    middle: 0,
    ring: 0,
    pinky: 0
  },
  activeFingers: {
    thumb: false,
    index: false,
    middle: false,
    ring: false,
    pinky: false
  }
};

const INITIAL_HANDS_STATE: HandsState = {
  left: { ...INITIAL_HAND_INFO },
  right: { ...INITIAL_HAND_INFO }
};

const INITIAL_GESTURE_STATE: GestureState = {
  activationFrames: 0,
  deactivationFrames: 0,
  isControlActive: false,
  brightnessControlFrames: 0,
  isBrightnessControl: false,
  initialY: null,
  initialX: null
};

const FRAMES_TO_ACTIVATE = 10;
const FRAMES_TO_DEACTIVATE = 15;
const FRAMES_TO_BRIGHTNESS = 10;

const HandTracking: React.FC<HandTrackingProps> = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [handsInfo, setHandsInfo] = useState<HandsState>(INITIAL_HANDS_STATE);
  const [gestureState, setGestureState] = useState<GestureState>(INITIAL_GESTURE_STATE);
  // Add ref to track current gesture state
  const currentGestureState = useRef<GestureState>(INITIAL_GESTURE_STATE);

  // Update ref whenever state changes
  useEffect(() => {
    currentGestureState.current = gestureState;
  }, [gestureState]);

  // Calculate finger extension for more accurate open hand detection
  const calculateFingerExtension = useCallback((landmarks: any) => {
    const fingerTips = [8, 12, 16, 20]; // Index, middle, ring, pinky tips
    const fingerMids = [7, 11, 15, 19]; // Middle joints
    const fingerBases = [5, 9, 13, 17]; // Base joints
    
    // Check thumb separately (it has different mechanics)
    // Use 3D vector comparison for thumb extension
    const thumbVec = {
      x: landmarks[4].x - landmarks[2].x,
      y: landmarks[4].y - landmarks[2].y,
      z: landmarks[4].z - landmarks[2].z
    };
    const palmVec = {
      x: landmarks[17].x - landmarks[1].x,
      y: landmarks[17].y - landmarks[1].y,
      z: landmarks[17].z - landmarks[1].z
    };
    // Calculate angle between thumb and palm
    const thumbMag = Math.sqrt(thumbVec.x * thumbVec.x + thumbVec.y * thumbVec.y + thumbVec.z * thumbVec.z);
    const palmMag = Math.sqrt(palmVec.x * palmVec.x + palmVec.y * palmVec.y + palmVec.z * palmVec.z);
    const dotProduct = thumbVec.x * palmVec.x + thumbVec.y * palmVec.y + thumbVec.z * palmVec.z;
    const thumbAngle = Math.acos(dotProduct / (thumbMag * palmMag));
    const thumbExtended = thumbAngle > Math.PI / 4; // Consider thumb extended if angle > 45 degrees
    
    // Check each finger using 3D vectors
    const fingerStates = fingerTips.map((tip, i) => {
      const tipPos = landmarks[tip];
      const midPos = landmarks[fingerMids[i]];
      const basePos = landmarks[fingerBases[i]];
      
      // Calculate vectors from base to mid and mid to tip
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
      
      // Calculate the angle between the vectors
      const baseMidMag = Math.sqrt(baseToMid.x * baseToMid.x + baseToMid.y * baseToMid.y + baseToMid.z * baseToMid.z);
      const midTipMag = Math.sqrt(midToTip.x * midToTip.x + midToTip.y * midToTip.y + midToTip.z * midToTip.z);
      const fingerDot = baseToMid.x * midToTip.x + baseToMid.y * midToTip.y + baseToMid.z * midToTip.z;
      const fingerAngle = Math.acos(fingerDot / (baseMidMag * midTipMag));
      
      // A finger is considered extended if it's relatively straight (angle close to 180 degrees)
      return fingerAngle > 2.8; // about 160 degrees
    });

    // Calculate confidence based on how extended each finger is
    const extendedFingers = [...fingerStates, thumbExtended];
    const openConfidence = extendedFingers.filter(Boolean).length / 5;
    const isFullyOpen = openConfidence === 1;

    return { isFullyOpen, openConfidence, extendedFingers };
  }, []);

  // Calculate finger straightness by measuring how far middle points deviate from base-to-tip line
  const calculateFingerStraightness = useCallback((landmarks: any, fingerPoints: number[]) => {
    if (fingerPoints.length < 4) return 0; // Need at least 4 points (base, 2 middle, tip)
    
    // Get base and tip points
    const base = landmarks[fingerPoints[0]];
    const tip = landmarks[fingerPoints[fingerPoints.length - 1]];
    
    // Calculate the vector from base to tip
    const lineVector = {
      x: tip.x - base.x,
      y: tip.y - base.y,
      z: tip.z - base.z
    };
    
    // Calculate the length of the base-to-tip line
    const lineLength = Math.sqrt(
      lineVector.x * lineVector.x + 
      lineVector.y * lineVector.y + 
      lineVector.z * lineVector.z
    );
    
    // If line is too short, finger is probably not visible
    if (lineLength < 0.0001) return 0;
    
    // Normalize the line vector
    const normalizedLine = {
      x: lineVector.x / lineLength,
      y: lineVector.y / lineLength,
      z: lineVector.z / lineLength
    };
    
    // For each middle point, calculate its distance from the base-tip line
    let totalDeviation = 0;
    for (let i = 1; i < fingerPoints.length - 1; i++) {
      const point = landmarks[fingerPoints[i]];
      
      // Vector from base to current point
      const pointVector = {
        x: point.x - base.x,
        y: point.y - base.y,
        z: point.z - base.z
      };
      
      // Project this vector onto the base-tip line
      const projection = 
        pointVector.x * normalizedLine.x + 
        pointVector.y * normalizedLine.y + 
        pointVector.z * normalizedLine.z;
      
      // Calculate the projected point on the line
      const projectedPoint = {
        x: base.x + normalizedLine.x * projection,
        y: base.y + normalizedLine.y * projection,
        z: base.z + normalizedLine.z * projection
      };
      
      // Calculate the distance from the middle point to the line
      const deviation = Math.sqrt(
        Math.pow(point.x - projectedPoint.x, 2) +
        Math.pow(point.y - projectedPoint.y, 2) +
        Math.pow(point.z - projectedPoint.z, 2)
      );
      
      totalDeviation += deviation;
    }
    
    // Convert deviation to straightness
    // The smaller the deviation, the straighter the finger
    // Normalize to 0-1 range where 1 is perfectly straight
    const maxDeviation = lineLength * 0.5; // Maximum expected deviation
    const straightness = Math.max(0, 1 - (totalDeviation / maxDeviation));
    
    return straightness;
  }, []);

  const analyzeHand = useCallback((landmarks: any, handedness: any) => {
    const indexTip = landmarks[8];
    const indexBase = landmarks[5];
    
    // Calculate pointing direction
    const pointingAngle = Math.atan2(
      indexTip.y - indexBase.y,
      indexTip.x - indexBase.x
    ) * (180 / Math.PI);

    // Convert angle to 0-360 range
    const normalizedAngle = (pointingAngle + 360) % 360;
    
    // Define direction zones with 45-degree segments
    let pointingDirection = 'none';
    if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) pointingDirection = 'right';
    else if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) pointingDirection = 'down-right';
    else if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) pointingDirection = 'down';
    else if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) pointingDirection = 'down-left';
    else if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) pointingDirection = 'left';
    else if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) pointingDirection = 'up-left';
    else if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) pointingDirection = 'up';
    else if (normalizedAngle >= 292.5 && normalizedAngle < 337.5) pointingDirection = 'up-right';

    // Analyze finger extension
    const { isFullyOpen, openConfidence } = calculateFingerExtension(landmarks);

    // Calculate straightness for all fingers
    const fingerStraightness = {
      thumb: calculateFingerStraightness(landmarks, [1, 2, 3, 4]),
      index: calculateFingerStraightness(landmarks, [5, 6, 7, 8]),
      middle: calculateFingerStraightness(landmarks, [9, 10, 11, 12]),
      ring: calculateFingerStraightness(landmarks, [13, 14, 15, 16]),
      pinky: calculateFingerStraightness(landmarks, [17, 18, 19, 20])
    };

    // Determine active fingers: all five for display, but only thumb/index for pointer
    const STRAIGHTNESS_THRESHOLD = 0.6;
    const rawStates = {
      index: fingerStraightness.index > STRAIGHTNESS_THRESHOLD,
      middle: fingerStraightness.middle > STRAIGHTNESS_THRESHOLD,
      ring: fingerStraightness.ring > STRAIGHTNESS_THRESHOLD,
      pinky: fingerStraightness.pinky > STRAIGHTNESS_THRESHOLD,
      thumb: fingerStraightness.thumb > STRAIGHTNESS_THRESHOLD,
    };
    // Pointer logic: only thumb or index, pick the straighter if both qualify
    let thumbActive = false;
    let indexActive = false;
    if (rawStates.thumb && rawStates.index) {
      if (fingerStraightness.thumb > fingerStraightness.index) thumbActive = true;
      else indexActive = true;
    } else {
      thumbActive = rawStates.thumb;
      indexActive = rawStates.index;
    }
    const activeFingers = {
      thumb: thumbActive,
      index: indexActive,
      middle: rawStates.middle,
      ring: rawStates.ring,
      pinky: rawStates.pinky,
    };

    const handInfo: HandInfo = {
      isOpen: isFullyOpen,
      openConfidence,
      pointingDirection,
      coordinates: {
        x: indexTip.x,
        y: indexTip.y
      },
      confidence: handedness.score,
      fingerStraightness,
      activeFingers
    };

    return handInfo;
  }, [calculateFingerExtension, calculateFingerStraightness]);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results: Results) => {
      const canvas = canvasRef.current;
      const video = webcamRef.current?.video;
      
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Account for device pixel ratio
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = video.videoWidth;
      const displayHeight = video.videoHeight;
      
      // Set canvas size accounting for pixel ratio
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      
      // Scale the context to account for the ratio
      ctx.scale(dpr, dpr);
      
      // Clear the canvas
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      if (results.multiHandLandmarks) {
        const newHandsInfo: HandsState = {
          left: { ...INITIAL_HAND_INFO },
          right: { ...INITIAL_HAND_INFO }
        };

        // Process hands and track which hands we've seen
        const seenLabels: Record<string, boolean> = {};
        
        // First, find and process the right hand (appears as 'Left' in landmarks due to mirroring)
        const rightHandIndex = results.multiHandedness.findIndex(h => h.label.toLowerCase() === 'left');
        if (rightHandIndex !== -1) {
          const landmarks = results.multiHandLandmarks[rightHandIndex];
          const handedness = results.multiHandedness[rightHandIndex];
          
          // Mirror the landmarks for the right hand
          const mirroredLandmarks = landmarks.map(landmark => ({
            ...landmark,
            x: 1 - landmark.x
          }));
          
          const handInfo = analyzeHand(mirroredLandmarks, handedness);
          newHandsInfo.right = handInfo;
          seenLabels['left'] = true;
          
          console.log('User Right Hand pointing:', handInfo.pointingDirection);
        }
        
        // Then find and process the left hand (appears as 'Right' in landmarks due to mirroring)
        const leftHandIndex = results.multiHandedness.findIndex(h => h.label.toLowerCase() === 'right');
        if (leftHandIndex !== -1) {
          const landmarks = results.multiHandLandmarks[leftHandIndex];
          const handedness = results.multiHandedness[leftHandIndex];
          
          // Mirror the landmarks for the left hand
          const mirroredLandmarks = landmarks.map(landmark => ({
            ...landmark,
            x: 1 - landmark.x
          }));
          
          const handInfo = analyzeHand(mirroredLandmarks, handedness);
          newHandsInfo.left = handInfo;
          seenLabels['right'] = true;
          
          console.log('User Left Hand pointing:', handInfo.pointingDirection);
        }

        // Now draw the hands with their correct styling
        results.multiHandLandmarks.forEach((landmarks, index) => {
          const handedness = results.multiHandedness[index];
          const isUserRight = handedness.label.toLowerCase() === 'left'; // 'Left' in video means user's right hand
          
          // Mirror the landmarks for drawing
          const mirroredLandmarks = landmarks.map(landmark => ({
            ...landmark,
            x: 1 - landmark.x
          }));
          
          // Draw overlays styled for user right/left hand
          if (isUserRight) {
            // User's right hand: red lines, green control dots with red outline
            drawConnectors(ctx, mirroredLandmarks, HAND_CONNECTIONS, { color: '#FF0000', lineWidth: 5 });
            ctx.fillStyle = '#00FF00';
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            mirroredLandmarks.forEach(({ x, y }) => {
              const px = x * displayWidth;
              const py = y * displayHeight;
              ctx.beginPath();
              ctx.arc(px, py, 5, 0, 2 * Math.PI);
              ctx.fill();
              ctx.stroke();
            });

            // Draw active fingers for right hand
            if (newHandsInfo.right.activeFingers.thumb) {
              // SACRED: Thumb tracking visualization - DO NOT REMOVE
              const thumbLandmarks = [1, 2, 3, 4];
              const thumbConnections = [[1, 2], [2, 3], [3, 4]];
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 5;
              thumbConnections.forEach(([start, end]) => {
                ctx.beginPath();
                ctx.moveTo(mirroredLandmarks[start].x * displayWidth, mirroredLandmarks[start].y * displayHeight);
                ctx.lineTo(mirroredLandmarks[end].x * displayWidth, mirroredLandmarks[end].y * displayHeight);
                ctx.stroke();
              });
              ctx.fillStyle = 'blue';
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 2;
              thumbLandmarks.forEach(i => {
                const { x, y } = mirroredLandmarks[i];
                const px = x * displayWidth;
                const py = y * displayHeight;
                ctx.beginPath();
                ctx.arc(px, py, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
              });
            }
            if (newHandsInfo.right.activeFingers.index) {
              // SACRED: Index finger tracking visualization - DO NOT REMOVE
              const indexLandmarks = [5, 6, 7, 8];
              const indexConnections = [[5, 6], [6, 7], [7, 8]];
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 5;
              indexConnections.forEach(([start, end]) => {
                ctx.beginPath();
                ctx.moveTo(mirroredLandmarks[start].x * displayWidth, mirroredLandmarks[start].y * displayHeight);
                ctx.lineTo(mirroredLandmarks[end].x * displayWidth, mirroredLandmarks[end].y * displayHeight);
                ctx.stroke();
              });
              ctx.fillStyle = 'blue';
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 2;
              indexLandmarks.forEach(i => {
                const { x, y } = mirroredLandmarks[i];
                const px = x * displayWidth;
                const py = y * displayHeight;
                ctx.beginPath();
                ctx.arc(px, py, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
              });
            }
          } else {
            // User's left hand: green lines, red control dots with green outline
            drawConnectors(ctx, mirroredLandmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
            ctx.fillStyle = '#FF0000';
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            mirroredLandmarks.forEach(({ x, y }) => {
              const px = x * displayWidth;
              const py = y * displayHeight;
              ctx.beginPath();
              ctx.arc(px, py, 5, 0, 2 * Math.PI);
              ctx.fill();
              ctx.stroke();
            });

            // Draw active fingers for left hand
            if (newHandsInfo.left.activeFingers.thumb) {
              // SACRED: Thumb tracking visualization - DO NOT REMOVE
              const thumbLandmarks = [1, 2, 3, 4];
              const thumbConnections = [[1, 2], [2, 3], [3, 4]];
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 5;
              thumbConnections.forEach(([start, end]) => {
                ctx.beginPath();
                ctx.moveTo(mirroredLandmarks[start].x * displayWidth, mirroredLandmarks[start].y * displayHeight);
                ctx.lineTo(mirroredLandmarks[end].x * displayWidth, mirroredLandmarks[end].y * displayHeight);
                ctx.stroke();
              });
              ctx.fillStyle = 'blue';
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 2;
              thumbLandmarks.forEach(i => {
                const { x, y } = mirroredLandmarks[i];
                const px = x * displayWidth;
                const py = y * displayHeight;
                ctx.beginPath();
                ctx.arc(px, py, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
              });
            }
            if (newHandsInfo.left.activeFingers.index) {
              // SACRED: Index finger tracking visualization - DO NOT REMOVE
              const indexLandmarks = [5, 6, 7, 8];
              const indexConnections = [[5, 6], [6, 7], [7, 8]];
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 5;
              indexConnections.forEach(([start, end]) => {
                ctx.beginPath();
                ctx.moveTo(mirroredLandmarks[start].x * displayWidth, mirroredLandmarks[start].y * displayHeight);
                ctx.lineTo(mirroredLandmarks[end].x * displayWidth, mirroredLandmarks[end].y * displayHeight);
                ctx.stroke();
              });
              ctx.fillStyle = 'blue';
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 2;
              indexLandmarks.forEach(i => {
                const { x, y } = mirroredLandmarks[i];
                const px = x * displayWidth;
                const py = y * displayHeight;
                ctx.beginPath();
                ctx.arc(px, py, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
              });
            }
          }

          // Additional visualizations can be added HERE, AFTER the sacred hand rendering code
          // Any new visualization features should be added below this line
          if (currentGestureState.current.isBrightnessControl) {
            const canvas = canvasRef.current;
            const video = webcamRef.current?.video;
            if (canvas && video) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                const landmarks = results.multiHandLandmarks[0];
                if (landmarks) {
                  const displayWidth = video.videoWidth;
                  const displayHeight = video.videoHeight;
                  
                  const indexTip = {
                    x: currentGestureState.current.initialX!,
                    y: landmarks[8].y
                  };

                  const x = indexTip.x * displayWidth;
                  let y = indexTip.y * displayHeight;
                  
                  // Save context state
                  ctx.save();

                  // Calculate line start and end points to make control point at 43% from bottom
                  const lineLength = displayHeight * 0.8; // Use 80% of display height
                  const bottomOffset = (displayHeight - lineLength) / 2;
                  const lineStart = bottomOffset;
                  const lineEnd = bottomOffset + lineLength;
                  
                  // Clamp y position to stay within line boundaries
                  y = Math.max(lineStart, Math.min(lineEnd, y));

                  // Draw vertical guide line with caps
                  ctx.beginPath();
                  ctx.strokeStyle = '#9933FF'; // Bright purple
                  ctx.lineWidth = 12; // Thicker line
                  ctx.lineCap = 'round';
                  ctx.moveTo(indexTip.x * displayWidth, lineStart);
                  ctx.lineTo(indexTip.x * displayWidth, lineEnd);
                  ctx.stroke();

                  // Draw line caps (circles at ends)
                  const capRadius = 12; // Bigger caps
                  ctx.fillStyle = '#9933FF'; // Match line color
                  
                  // Top cap
                  ctx.beginPath();
                  ctx.arc(indexTip.x * displayWidth, lineStart, capRadius, 0, 2 * Math.PI);
                  ctx.fill();
                  
                  // Bottom cap
                  ctx.beginPath();
                  ctx.arc(indexTip.x * displayWidth, lineEnd, capRadius, 0, 2 * Math.PI);
                  ctx.fill();

                  // Calculate and display percentage
                  const controlRange = lineEnd - lineStart;
                  const controlPosition = y - lineStart;
                  const percentage = Math.round((1 - (controlPosition / controlRange)) * 100);
                  
                  // Check pointing direction for text position - using the right hand's info
                  const isPointingLeft = newHandsInfo.right.pointingDirection.includes('left');
                  const isPointingRight = newHandsInfo.right.pointingDirection.includes('right');
                  
                  // Display percentage
                  ctx.font = 'bold 52px Arial';
                  ctx.fillStyle = '#FFFFFF';
                  ctx.strokeStyle = '#000000';
                  ctx.lineWidth = 4;
                  
                  ctx.textAlign = isPointingLeft ? 'left' : isPointingRight ? 'right' : 'center';
                  ctx.textBaseline = 'middle';
                  const textOffset = isPointingLeft ? 150 : isPointingRight ? -150 : 0;
                  
                  ctx.strokeText(`${percentage}%`, indexTip.x * displayWidth - textOffset, y);
                  ctx.fillText(`${percentage}%`, indexTip.x * displayWidth - textOffset, y);

                  // Draw outer glow
                  const gradient = ctx.createRadialGradient(indexTip.x * displayWidth, y, 12, indexTip.x * displayWidth, y, 24); // Bigger glow
                  gradient.addColorStop(0, 'rgba(153, 51, 255, 0.3)');
                  gradient.addColorStop(1, 'rgba(153, 51, 255, 0)');
                  ctx.beginPath();
                  ctx.arc(indexTip.x * displayWidth, y, 24, 0, 2 * Math.PI);
                  ctx.fillStyle = gradient;
                  ctx.fill();

                  // Draw control point
                  ctx.beginPath();
                  ctx.arc(indexTip.x * displayWidth, y, 12, 0, 2 * Math.PI); // Bigger control point
                  ctx.fillStyle = '#9933FF';
                  ctx.fill();
                  ctx.strokeStyle = '#FFFFFF';
                  ctx.lineWidth = 2;
                  ctx.stroke();

                  // Draw crosshair
                  const crosshairSize = 6; // Bigger crosshair
                  ctx.beginPath();
                  ctx.strokeStyle = '#FFFFFF';
                  ctx.lineWidth = 2;
                  ctx.moveTo(indexTip.x * displayWidth - crosshairSize, y);
                  ctx.lineTo(indexTip.x * displayWidth + crosshairSize, y);
                  ctx.moveTo(indexTip.x * displayWidth, y - crosshairSize);
                  ctx.lineTo(indexTip.x * displayWidth, y + crosshairSize);
                  ctx.stroke();

                  // Restore context state
                  ctx.restore();
                }
              }
            }
          }

          // Process gesture state
          setGestureState(prevState => {
            // Check for deactivation conditions
            const shouldDeactivate = (
              // No hands detected
              !results.multiHandLandmarks || 
              results.multiHandLandmarks.length === 0 ||
              // Or if we have hands but in control mode with invalid gestures
              (prevState.isControlActive && (
                // Check for invalid fingers or all fingers down
                newHandsInfo.right.activeFingers.middle || 
                newHandsInfo.right.activeFingers.ring ||
                newHandsInfo.right.activeFingers.thumb ||
                !Object.values(newHandsInfo.right.activeFingers).some(active => active)
              ))
            );

            // If should deactivate, increment counter
            if (shouldDeactivate) {
              const newDeactivationFrames = prevState.deactivationFrames + 1;
              if (newDeactivationFrames >= FRAMES_TO_DEACTIVATE) {
                const newState = { ...INITIAL_GESTURE_STATE };
                currentGestureState.current = newState;
                return newState;
              }
              return {
                ...prevState,
                deactivationFrames: newDeactivationFrames
              };
            }

            // If we get here, no deactivation conditions are met
            // Reset deactivation counter and continue with normal logic
            const rightHand = newHandsInfo.right;
            
            // Check for activation gesture (index + pinky)
            const isActivationGesture = rightHand.activeFingers.index && 
                                      rightHand.activeFingers.pinky &&
                                      !rightHand.activeFingers.middle && 
                                      !rightHand.activeFingers.ring &&
                                      !rightHand.activeFingers.thumb;

            // If already in control mode, continue with brightness control logic
            if (prevState.isControlActive) {
              // Check for brightness control mode
              const isPinkyDown = !rightHand.activeFingers.pinky && rightHand.activeFingers.index;
              const isPointingHorizontal = rightHand.pointingDirection.includes('left') || 
                                         rightHand.pointingDirection.includes('right');
              const isPointingVertical = rightHand.pointingDirection === 'up' || 
                                       rightHand.pointingDirection === 'down';

              // Exit brightness control if pointing vertical or pinky up
              if (prevState.isBrightnessControl && (isPointingVertical || !isPinkyDown)) {
                const newState = {
                  ...prevState,
                  brightnessControlFrames: 0,
                  isBrightnessControl: false,
                  initialY: null,
                  deactivationFrames: 0
                };
                currentGestureState.current = newState;
                return newState;
              }

              // Enter brightness control mode
              if (isPinkyDown && isPointingHorizontal) {
                if (!prevState.isBrightnessControl) {
                  const newBrightnessFrames = prevState.brightnessControlFrames + 1;
                  if (newBrightnessFrames >= FRAMES_TO_BRIGHTNESS) {
                    const newState = {
                      ...prevState,
                      brightnessControlFrames: newBrightnessFrames,
                      isBrightnessControl: true,
                      initialY: rightHand.coordinates.y,
                      initialX: rightHand.coordinates.x,
                      deactivationFrames: 0
                    };
                    currentGestureState.current = newState;
                    return newState;
                  }
                  const newState = {
                    ...prevState,
                    brightnessControlFrames: newBrightnessFrames,
                    deactivationFrames: 0
                  };
                  currentGestureState.current = newState;
                  return newState;
                }
                // Update initialY if needed while in brightness control
                const newState = {
                  ...prevState,
                  deactivationFrames: 0
                };
                currentGestureState.current = newState;
                return newState;
              }

              // Reset brightness frames if not in correct position
              const newState = {
                ...prevState,
                brightnessControlFrames: 0,
                deactivationFrames: 0
              };
              currentGestureState.current = newState;
              return newState;
            }

            // If gesture is not maintained, reset activation
            if (!isActivationGesture) {
              const newState = { ...INITIAL_GESTURE_STATE };
              currentGestureState.current = newState;
              return newState;
            }

            // Count frames for activation
            const newFrames = prevState.activationFrames + 1;
            if (newFrames >= FRAMES_TO_ACTIVATE) {
              const newState = {
                ...INITIAL_GESTURE_STATE,
                activationFrames: newFrames,
                isControlActive: true
              };
              currentGestureState.current = newState;
              return newState;
            }
            
            const newState = {
              ...INITIAL_GESTURE_STATE,
              activationFrames: newFrames,
              isControlActive: false
            };
            currentGestureState.current = newState;
            return newState;
          });

          // Invert the handedness for correct user perspective
          if (handedness.label.toLowerCase() === 'right') {
              newHandsInfo.left = handInfo; // User's left hand
            } else {
              newHandsInfo.right = handInfo; // User's right hand
          }
        });

        setHandsInfo(newHandsInfo);
      }
    });

    if (webcamRef.current?.video) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current?.video) {
            await hands.send({ image: webcamRef.current.video }).catch(() => {});
          }
        },
        width: 1920,
        height: 1080,
      });
      
      camera.start().catch(() => {});
    }
  }, [analyzeHand]);

  return (
    <div className="hand-tracking-container">
      <div className="video-container">
        <Webcam
          ref={webcamRef}
          mirrored={true}
          videoConstraints={{
            width: 1920,
            height: 1080,
            aspectRatio: 16/9,
            facingMode: "user"
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
      <GestureDisplay 
        handsInfo={handsInfo} 
        controlState={{
          activationFrames: gestureState.activationFrames,
          isControlActive: gestureState.isControlActive,
          brightnessControlFrames: gestureState.brightnessControlFrames,
          isBrightnessControl: gestureState.isBrightnessControl
        }}
        onCooldownComplete={() => {
          setGestureState(INITIAL_GESTURE_STATE);
          currentGestureState.current = INITIAL_GESTURE_STATE;
        }}
      />
    </div>
  );
};

// Helper functions for drawing
const drawConnectors = (
  ctx: CanvasRenderingContext2D,
  landmarks: any,
  connections: any,
  style: { color: string; lineWidth: number }
) => {
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.lineWidth;

  for (const connection of connections) {
    const [start, end] = connection;
    ctx.beginPath();
    ctx.moveTo(landmarks[start].x * ctx.canvas.width, landmarks[start].y * ctx.canvas.height);
    ctx.lineTo(landmarks[end].x * ctx.canvas.width, landmarks[end].y * ctx.canvas.height);
    ctx.stroke();
  }
};

// Hand connections for drawing
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17], [17, 0]
];

export default HandTracking; 