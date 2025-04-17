import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import './HandTracking.css';

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
}

interface HandsState {
  left: HandInfo;
  right: HandInfo;
}

const INITIAL_HAND_INFO: HandInfo = {
  isOpen: false,
  openConfidence: 0,
  pointingDirection: 'none',
  coordinates: { x: 0, y: 0 },
  confidence: 0
};

const INITIAL_HANDS_STATE: HandsState = {
  left: { ...INITIAL_HAND_INFO },
  right: { ...INITIAL_HAND_INFO }
};

const HandTracking: React.FC<HandTrackingProps> = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [handsInfo, setHandsInfo] = useState<HandsState>(INITIAL_HANDS_STATE);

  // Calculate finger extension for more accurate open hand detection
  const calculateFingerExtension = useCallback((landmarks: any) => {
    const fingerTips = [8, 12, 16, 20]; // Index, middle, ring, pinky tips
    const fingerMids = [7, 11, 15, 19]; // Middle joints
    const fingerBases = [5, 9, 13, 17]; // Base joints
    const wrist = landmarks[0];
    
    // Check thumb separately (it has different mechanics)
    const thumbExtended = landmarks[4].x < landmarks[3].x; // Simple thumb check
    
    // Check each finger
    const fingerStates = fingerTips.map((tip, i) => {
      const tipPos = landmarks[tip];
      const midPos = landmarks[fingerMids[i]];
      const basePos = landmarks[fingerBases[i]];
      
      // Calculate angles and distances
      const fingerExtension = (tipPos.y < midPos.y && midPos.y < basePos.y);
      return fingerExtension;
    });

    // Calculate confidence based on how extended each finger is
    const extendedFingers = [...fingerStates, thumbExtended];
    const openConfidence = extendedFingers.filter(Boolean).length / 5;
    const isFullyOpen = openConfidence === 1;

    return { isFullyOpen, openConfidence };
  }, []);

  const analyzeHand = useCallback((landmarks: any, handedness: any) => {
    const indexTip = landmarks[8];
    const indexBase = landmarks[5];
    
    // Calculate pointing direction
    const pointingAngle = Math.atan2(
      indexTip.y - indexBase.y,
      indexTip.x - indexBase.x
    ) * (180 / Math.PI);

    let pointingDirection = 'none';
    if (pointingAngle < -45 && pointingAngle > -135) pointingDirection = 'up';
    else if (pointingAngle > 45 && pointingAngle < 135) pointingDirection = 'down';
    else if (Math.abs(pointingAngle) <= 45) pointingDirection = 'right';
    else if (Math.abs(pointingAngle) >= 135) pointingDirection = 'left';

    // Analyze finger extension
    const { isFullyOpen, openConfidence } = calculateFingerExtension(landmarks);

    const handInfo: HandInfo = {
      isOpen: isFullyOpen,
      openConfidence,
      pointingDirection,
      coordinates: {
        x: indexTip.x,
        y: indexTip.y
      },
      confidence: handedness.score
    };

    return handInfo;
  }, [calculateFingerExtension]);

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

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Clear the canvas so it's transparent and only hand landmarks are drawn
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks) {
        const newHandsInfo: HandsState = {
          left: { ...INITIAL_HAND_INFO },
          right: { ...INITIAL_HAND_INFO }
        };
        
        results.multiHandLandmarks.forEach((landmarks, index) => {
          const handedness = results.multiHandedness[index];
          
          // Mirror the landmarks
          const mirroredLandmarks = landmarks.map(landmark => ({
            ...landmark,
            x: 1 - landmark.x // Mirror the x coordinate
          }));
          
          const handInfo = analyzeHand(mirroredLandmarks, handedness);
          
          // Draw landmarks on mirrored context
          drawConnectors(ctx, mirroredLandmarks, HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 5,
          });
          drawLandmarks(ctx, mirroredLandmarks, { color: '#FF0000', lineWidth: 10 });

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
            await hands.send({ image: webcamRef.current.video });
          }
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }

    return () => {
      hands.close();
    };
  }, [analyzeHand]);

  const renderHandInfo = (handInfo: HandInfo, handName: string) => (
    <div className="hand-card">
      <h3>Your {handName} Hand</h3>
      <p>Status: {handInfo.isOpen ? 'Open' : 'Closed'}</p>
      <p>Pointing: {handInfo.pointingDirection}</p>
      <div className="confidence-bar">
        <div 
          className="confidence-bar-fill" 
          style={{ width: `${handInfo.openConfidence * 100}%` }}
        />
      </div>
      <p>Open Confidence: {Math.round(handInfo.openConfidence * 100)}%</p>
      <p>Detection Confidence: {Math.round(handInfo.confidence * 100)}%</p>
    </div>
  );

  return (
    <div className="hand-tracking-container">
      <div className="video-container">
        <Webcam
          ref={webcamRef}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 9,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror the video feed
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 10,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      <div className="gesture-display">
        <h2>Hand Tracking Status</h2>
        <div className="hand-info">
          {renderHandInfo(handsInfo.left, 'Left')}
          {renderHandInfo(handsInfo.right, 'Right')}
        </div>
      </div>
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

const drawLandmarks = (
  ctx: CanvasRenderingContext2D,
  landmarks: any,
  style: { color: string; lineWidth: number }
) => {
  ctx.fillStyle = style.color;

  for (const landmark of landmarks) {
    ctx.beginPath();
    ctx.arc(
      landmark.x * ctx.canvas.width,
      landmark.y * ctx.canvas.height,
      style.lineWidth,
      0,
      2 * Math.PI
    );
    ctx.fill();
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