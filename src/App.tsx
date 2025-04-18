import React from 'react';
import { TabControl } from './components/TabControl';
import { BrightnessProvider } from './contexts/BrightnessContext';
import './App.css';

function App() {
  return (
    <BrightnessProvider>
      <div className="App">
        <TabControl />
      </div>
    </BrightnessProvider>
  );
}

export default App; 