import React, { useState, useRef, useEffect } from "react";
import "./GestureDisplay.css";

export interface HandInfo {
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
  extendedFingers: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  };
}

export interface HandsState {
  left: HandInfo;
  right: HandInfo;
}

interface GestureDisplayProps {
  handsInfo: HandsState;
  controlState: {
    activationFrames: number;
    isGestureControlActive: boolean;
    brightnessControlFrames: number;
    isBrightnessControl: boolean;
  };
  onCooldownComplete: () => void;
}

const GestureDisplay: React.FC<GestureDisplayProps> = ({
  handsInfo,
  controlState,
  onCooldownComplete,
}) => {
  const [isModesEnabled, setIsModesEnabled] = useState(true);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName === "width") {
        const width = (e.target as HTMLElement).style.width;
        const newEnabled = width === "100%";
        setIsModesEnabled(newEnabled);

        // Call the callback when cooldown completes (bar reaches 0)
        if (!newEnabled && onCooldownComplete) {
          onCooldownComplete();
        }
      }
    };

    const bar = barRef.current;
    if (bar) {
      bar.addEventListener("transitionend", handleTransitionEnd);
    }

    return () => {
      if (bar) {
        bar.removeEventListener("transitionend", handleTransitionEnd);
      }
    };
  }, [controlState, onCooldownComplete]);

  const renderHandInfo = (handInfo: HandInfo, handName: string) => (
    <div className="hand-card">
      <h3>Your {handName} Hand</h3>
      <p>Pointing: {handInfo.pointingDirection}</p>
      <div className={`tracking-indicators ${handName.toLowerCase()}`}>
        <div className={`hand-info-container ${handName.toLowerCase()}`}>
          <div className="palm-dot">
            <svg className={`palm-svg ${handName.toLowerCase()}`} viewBox="0 0 210 297">
              <defs>
                <linearGradient id="palmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'rgba(51, 51, 51, 0.95)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(42, 42, 42, 0.95)' }} />
                </linearGradient>
                <filter id="palmShadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0, 0, 0, 0.2)" />
                </filter>
              </defs>
              
              {/* Pinky Finger */}
              <path
                className={`finger-path pinky ${handInfo.extendedFingers.pinky ? "active" : ""}`}
                d={handName === "Left" 
                  ? "m 40.549401,120.04251 c -0.24358,-0.55287 -0.91451,-4.33897 -1.49096,-8.41355 -3.95767,-27.974175 -5.0156,-33.681975 -7.01237,-37.833425 -2.99701,-6.23105 -9.17891,-8.09829 -13.23111,-3.99647 -3.84868,3.89582 -4.60805,10.37118 -2.91963,24.89656 0.20298,1.74625 1.027663,8.354225 1.83259,14.684375 1.127352,8.86579 1.845712,14.67828 2.299721,19.70339 0.594992,6.58556 8.473896,7.5837 14.979122,4.63122 6.959662,-3.15873 6.690975,-11.06564 5.542637,-13.6721 z"
                  : "m 169.4506,120.04251 c 0.24358,-0.55287 0.91451,-4.33897 1.49096,-8.41355 3.95767,-27.974175 5.0156,-33.681975 7.01237,-37.833425 2.99701,-6.23105 9.17891,-8.09829 13.23111,-3.99647 3.84868,3.89582 4.60805,10.37118 2.91963,24.89656 -0.20298,1.74625 -1.027663,8.354225 -1.83259,14.684375 -1.127352,8.86579 -1.845712,14.67828 -2.299721,19.70339 -0.594992,6.58556 -8.473896,7.5837 -14.979122,4.63122 -6.959662,-3.15873 -6.690975,-11.06564 -5.542637,-13.6721 z"
                }
              />
              
              {/* Ring Finger */}
              <path
                className={`finger-path ring ${handInfo.extendedFingers.ring ? "active" : ""}`}
                d={handName === "Left"
                  ? "m 70.038704,110.912 c -0.229524,-2.70526 -0.433651,-5.60783 -1.097703,-17.671584 -1.589542,-28.877025 -2.5186,-44.673903 -3.18528,-50.198364 -0.76207,-6.314988 -3.8985,-11.554822 -7.79191,-13.017473 -2.28194,-0.857261 -4.94062,-0.714137 -6.32318,0.340392 -1.59627,1.217528 -3.28033,3.589099 -4.15652,5.85337 -1.62735,4.205616 -1.69095,4.814798 -1.67105,16.011661 0.01,5.602552 0.16326,12.389114 0.34063,15.081249 2.668312,41.476829 2.905839,46.020079 3.007785,49.347109 0.184075,6.00733 8.08128,6.74695 11.675348,5.85691 4.038081,-1 9.846796,-4.00204 9.20188,-11.60327 z"
                  : "m 139.9613,110.912 c 0.229524,-2.70526 0.433651,-5.60783 1.097703,-17.671584 1.589542,-28.877025 2.5186,-44.673903 3.18528,-50.198364 0.76207,-6.314988 3.8985,-11.554822 7.79191,-13.017473 2.28194,-0.857261 4.94062,-0.714137 6.32318,0.340392 1.59627,1.217528 3.28033,3.589099 4.15652,5.85337 1.62735,4.205616 1.69095,4.814798 1.67105,16.011661 -0.01,5.602552 -0.16326,12.389114 -0.34063,15.081249 -2.668312,41.476829 -2.905839,46.020079 -3.007785,49.347109 -0.184075,6.00733 -8.08128,6.74695 -11.675348,5.85691 -4.038081,-1 -9.846796,-4.00204 -9.20188,-11.60327 z"
                }
              />
              
              {/* Middle Finger */}
              <path
                className={`finger-path middle ${handInfo.extendedFingers.middle ? "active" : ""}`}
                d={handName === "Left"
                  ? "m 99.47728,107.70367 c 0.67194,-10.421544 1.71985,-29.074013 2.44764,-43.567419 0.24498,-4.874947 0.4338,-29.486178 0.006,-31.353123 -1.05744,-4.614677 -3.82737,-8.725637 -6.58814,-9.77772 -1.89066,-0.720495 -4.92939,-0.484774 -6.78747,0.526518 -1.89907,1.033602 -3.55598,2.951353 -4.77324,5.524657 -1.81339,3.83353 -2.10603,5.725795 -2.78595,18.014044 -0.39626,7.161765 -0.56075,10.84196 -1.99857,44.714581 -0.42622,10.040932 -0.601491,13.085252 -0.83637,16.939352 -0.379294,6.22382 6.369451,8.72165 10.246881,8.79101 4.968806,0.0889 10.681718,-3.45907 11.069219,-9.8119 z"
                  : "m 110.52272,107.70367 c -0.67194,-10.421544 -1.71985,-29.074013 -2.44764,-43.567419 -0.24498,-4.874947 -0.4338,-29.486178 -0.006,-31.353123 1.05744,-4.614677 3.82737,-8.725637 6.58814,-9.77772 1.89066,-0.720495 4.92939,-0.484774 6.78747,0.526518 1.89907,1.033602 3.55598,2.951353 4.77324,5.524657 1.81339,3.83353 2.10603,5.725795 2.78595,18.014044 0.39626,7.161765 0.56075,10.84196 1.99857,44.714581 0.42622,10.040932 0.601491,13.085252 0.83637,16.939352 0.379294,6.22382 -6.369451,8.72165 -10.246881,8.79101 -4.968806,0.0889 -10.681718,-3.45907 -11.069219,-9.8119 z"
                }
              />
              
              {/* Index Finger */}
              <path
                className={`finger-path index ${handInfo.extendedFingers.index ? "active" : ""}`}
                d={handName === "Left"
                  ? "m 128.86685,113.86027 c 1.36557,-9.9046 5.30589,-39.436558 6.91842,-53.295894 0.96292,-8.276055 1.02464,-15.329633 0.16391,-18.731936 -0.73991,-2.924753 -1.71767,-4.935361 -3.204,-6.588512 -1.44152,-1.603319 -2.51137,-2.063925 -4.79389,-2.063925 -2.39115,0 -4.85988,1.201628 -6.92343,3.369905 -3.74478,3.934844 -4.15726,5.674066 -7.63494,30.629051 -4.74615,34.057171 -6.30707,43.186261 -6.91874,45.385651 -1.71068,6.15118 4.8595,10.18722 9.29484,10.50773 4.55438,0.32911 11.85008,-0.16207 13.09783,-9.21207 z"
                  : "m 81.13315,113.86027 c -1.36557,-9.9046 -5.30589,-39.436558 -6.91842,-53.295894 -0.96292,-8.276055 -1.02464,-15.329633 -0.16391,-18.731936 0.73991,-2.924753 1.71767,-4.935361 3.204,-6.588512 1.44152,-1.603319 2.51137,-2.063925 4.79389,-2.063925 2.39115,0 4.85988,1.201628 6.92343,3.369905 3.74478,3.934844 4.15726,5.674066 7.63494,30.629051 4.74615,34.057171 6.30707,43.186261 6.91874,45.385651 1.71068,6.15118 -4.8595,10.18722 -9.29484,10.50773 -4.55438,0.32911 -11.85008,-0.16207 -13.09783,-9.21207 z"
                }
              />
              
              {/* Thumb */}
              <path
                className={`finger-path thumb ${handInfo.extendedFingers.thumb ? "active" : ""}`}
                d={handName === "Left"
                  ? "m 123.81676,150.41553 c 7.51647,-2.57101 8.05386,-2.9931 9.91943,-7.79126 5.90725,-15.19316 14.65387,-30.7701 26.49102,-34.71431 13.002,-3.20249 15.65872,6.31671 9.00238,19.0428 -6.54888,12.52062 -12.14017,31.04567 -16.78691,45.12898 -4.2754,12.95787 -8.82742,29.80833 -21.634,43.08484 -9.73806,10.84702 -28.89208,17.87681 -39.263578,8.63436 -9.035238,-8.05166 -11.081344,-18.02175 -11.35675,-26.40345 1.049484,-24.37248 22.603628,-39.48501 43.628408,-46.98196 z"
                  : "m 86.18324,150.41553 c -7.51647,-2.57101 -8.05386,-2.9931 -9.91943,-7.79126 -5.90725,-15.19316 -14.65387,-30.7701 -26.49102,-34.71431 -13.002,-3.20249 -15.65872,6.31671 -9.00238,19.0428 6.54888,12.52062 12.14017,31.04567 16.78691,45.12898 4.2754,12.95787 8.82742,29.80833 21.634,43.08484 9.73806,10.84702 28.89208,17.87681 39.263578,8.63436 9.035238,-8.05166 11.081344,-18.02175 11.35675,-26.40345 -1.049484,-24.37248 -22.603628,-39.48501 -43.628408,-46.98196 z"
                }
              />
              
              {/* Palm */}
              <path
                className={`palm-path ${handInfo.confidence > 0.5 ? "active" : ""}`}
                d={handName === "Left"
                  ? "m 24.360245,142.93313 c -3.672071,2.26892 -3.584681,10.38933 -3.592331,14.06324 -0.03684,17.69144 0.736252,22.82186 1.619752,29.7486 3.754226,29.43419 18.057581,37.48612 19.301448,40.75769 0.964699,2.53744 -1.122072,15.3443 1.82573,16.94625 0.58878,0.32 5.84977,0.37806 35.03559,0.38706 37.805276,0.0117 35.425096,0.1165 36.315086,-1.60455 0.26933,-0.52082 2.14815,-14.71506 -1.42341,-13.34891 -18.725583,7.16278 -37.419438,-9.46369 -36.177157,-32.11981 1.028641,-8.91487 0.132604,-31.15891 40.630107,-47.49061 2.40065,-0.96812 4.41276,-2.03375 5.6689,-3.96832 2.66726,-4.10781 3.13093,-12.13069 2.79988,-14.42415 -0.85829,-5.94606 -27.735489,-14.46949 -54.72919,-10.32746 -20.140811,3.09049 -39.269495,16.43485 -47.274405,21.38097 z"
                  : "m 185.63976,142.93313 c 3.672071,2.26892 3.584681,10.38933 3.592331,14.06324 0.03684,17.69144 -0.736252,22.82186 -1.619752,29.7486 -3.754226,29.43419 -18.057581,37.48612 -19.301448,40.75769 -0.964699,2.53744 1.122072,15.3443 -1.82573,16.94625 -0.58878,0.32 -5.84977,0.37806 -35.03559,0.38706 -37.805276,0.0117 -35.425096,0.1165 -36.315086,-1.60455 -0.26933,-0.52082 -2.14815,-14.71506 1.42341,-13.34891 18.725583,7.16278 37.419438,-9.46369 36.177157,-32.11981 -1.028641,-8.91487 -0.132604,-31.15891 -40.630107,-47.49061 -2.40065,-0.96812 -4.41276,-2.03375 -5.6689,-3.96832 -2.66726,-4.10781 -3.13093,-12.13069 -2.79988,-14.42415 0.85829,-5.94606 27.735489,-14.46949 54.72919,-10.32746 20.140811,3.09049 39.269495,16.43485 47.274405,21.38097 z"
                }
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="confidence-bar">
        <div className="confidence-bar-fill" style={{ width: `${handInfo.confidence * 100}%` }} />
      </div>
      <p>Detection Confidence: {Math.round(handInfo.confidence * 100)}%</p>
      <div className="finger-straightness">
        <h4>Finger Straightness</h4>
        {Object.entries(handInfo.fingerStraightness).map(([finger, straightness]) => (
          <div key={finger} className="finger-metric">
            <p>
              {finger.charAt(0).toUpperCase() + finger.slice(1)}: {Math.round(straightness * 100)}%
            </p>
            <div className="confidence-bar">
              <div
                className="confidence-bar-fill"
                style={{
                  width: `${straightness * 100}%`,
                  backgroundColor: finger === "thumb" || finger === "index" ? "#4CAF50" : "#888",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const handConfidence =
    Math.max(handsInfo.left.confidence * 100, handsInfo.right.confidence * 100) > 50;

  return (
    <div className="gesture-display">
      <h2>Hand Tracking Status</h2>
      {controlState && (
        <div className="control-indicators">
          <div
            className="control-indicator"
            style={{
              margin: "10px 0",
              padding: "15px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <h3 style={{ margin: 0 }}>Mode Cooldown</h3>
            <div className="confidence-bar" style={{ width: "100%" }}>
              <div
                ref={barRef}
                className="cooldown-bar-fill"
                style={{ width: `${handConfidence ? "100" : "0"}%` }}
              />
            </div>
            <div
              className="tracking-indicators"
              style={{
                margin: 0,
                justifyContent: "flex-start",
                opacity: isModesEnabled ? 1 : 0.5,
                pointerEvents: isModesEnabled ? "auto" : "none",
              }}
            >
              <div className="tracking-dot">
                <div
                  className={`control-dot ${
                    isModesEnabled && controlState.isGestureControlActive ? "active" : ""
                  }`}
                >
                  {isModesEnabled &&
                    !controlState.isGestureControlActive &&
                    controlState.activationFrames > 0 && (
                      <svg className="progress-ring" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#ffd700"
                          strokeWidth="2"
                          strokeDasharray={`${controlState.activationFrames * 10}, 100`}
                        />
                      </svg>
                    )}
                </div>
                <span>Light Control Mode</span>
              </div>

              {isModesEnabled && controlState.isGestureControlActive && (
                <div className="tracking-dot">
                  <div
                    className={`control-dot ${controlState.isBrightnessControl ? "active" : ""}`}
                  >
                    {!controlState.isBrightnessControl &&
                      controlState.brightnessControlFrames > 0 && (
                        <svg className="progress-ring" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#ffd700"
                            strokeWidth="2"
                            strokeDasharray={`${controlState.brightnessControlFrames * 10}, 100`}
                          />
                        </svg>
                      )}
                  </div>
                  <span>Brightness Control</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="hand-info">
        {renderHandInfo(handsInfo.left, "Left")}
        {renderHandInfo(handsInfo.right, "Right")}
      </div>
    </div>
  );
};

export default GestureDisplay;
