import { useState, useEffect, useCallback } from "react";
import './HueLight.css';
import { useBrightness } from '../contexts/BrightnessContext';

const BRIDGE   = "192.168.0.247";
const USERNAME = "dwK-ASrDOMrzFtQGo82vvs2SJDK2jKMygzTPh9Ew";
const LIGHT_ID = 21;

/**
 * The subset of the Hue API light object we care about.
 */
interface LightState {
  on: boolean;
  bri: number;
}

/**
 * Performs a GET on /lights/:id and returns the state.
 */
async function fetchLightState(): Promise<LightState> {
  const res = await fetch(
    `http://${BRIDGE}/api/${USERNAME}/lights/${LIGHT_ID}`
  );
  const data = await res.json();
  return { on: data.state.on, bri: data.state.bri };
}

/**
 * Sends a PUT to /lights/:id/state with the given patch.
 */
async function updateLightState(patch: Partial<LightState>) {
  await fetch(
    `http://${BRIDGE}/api/${USERNAME}/lights/${LIGHT_ID}/state`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }
  );
}

export function HueLight() {
  const [state, setState] = useState<LightState | null>(null);
  const [loading, setLoading] = useState(false);
  const [localBri, setLocalBri] = useState(0);
  const { brightness } = useBrightness();

  // Fetch on mount
  useEffect(() => {
    fetchLightState().then((newState) => {
      setState(newState);
      setLocalBri(newState.bri);
    });
  }, []);

  // Update local brightness when context changes
  useEffect(() => {
    if (state?.on) {
      const newBri = Math.round((brightness / 100) * 254);
      setLocalBri(newBri);
      updateLightState({ bri: newBri });
    }
  }, [brightness, state?.on]);

  // Toggle on/off and re-fetch
  const toggle = useCallback(async () => {
    if (!state) return;
    setLoading(true);
    await updateLightState({ on: !state.on });
    const newState = await fetchLightState();
    setState(newState);
    setLocalBri(newState.bri);
    setLoading(false);
  }, [state]);

  // Handle brightness changes - update local and send to API immediately
  const onBriChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newBri = Number(e.target.value);
    setLocalBri(newBri);
    updateLightState({ bri: newBri }); // Fire and forget
  }, []);

  if (state === null) {
    return <div>Loading Hue light…</div>;
  }

  const brightnessPercent = Math.round((localBri / 254) * 100);

  return (
    <div className="light-control">
      <div className="light-header">
        <h2>Marcus's Ceiling Lamp</h2>
        <button 
          className="toggle-button"
          onClick={toggle} 
          disabled={loading}
        >
          {state.on ? "Turn Off" : "Turn On"}
        </button>
      </div>

      <div className="brightness-control">
        <div className="brightness-label">
          <span>Brightness</span>
          <span className="brightness-value">{brightnessPercent}%</span>
        </div>
        <div className="slider-container">
          <div className="gradient-background" />
          <input
            type="range"
            min="0"
            max="254"
            value={localBri}
            onChange={onBriChange}
            disabled={loading || !state.on}
            style={{ '--background-size': `${brightnessPercent}%` } as React.CSSProperties}
          />
        </div>
      </div>

      {loading && <div className="loading-indicator">Updating…</div>}
    </div>
  );
}
