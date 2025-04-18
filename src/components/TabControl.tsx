import React from 'react';
import HandTracking from './HandTracking';
import { HueLight } from './HueLight';

export type TabName = 'viewport' | 'configuration';

export const TabControl: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabName>('viewport');

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <button 
          className={`tab-button ${activeTab === 'viewport' ? 'active' : ''}`}
          onClick={() => setActiveTab('viewport')}
        >
          Viewport
        </button>
        <button 
          className={`tab-button ${activeTab === 'configuration' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuration')}
        >
          Configuration
        </button>
      </div>

      <div className={`tab-content ${activeTab === 'viewport' ? 'active' : ''}`}>
        <HandTracking />
      </div>

      <div className={`tab-content ${activeTab === 'configuration' ? 'active' : ''}`}>
        <div className="configuration-panel">
          <h2>Light Configuration</h2>
          <div className="light-controls">
            <HueLight />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabControl; 