import React, { createContext, useContext, useState } from 'react';

interface BrightnessContextType {
  brightness: number;
  setBrightness: (value: number) => void;
}

const BrightnessContext = createContext<BrightnessContextType | undefined>(undefined);

export const BrightnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brightness, setBrightness] = useState(0);

  return (
    <BrightnessContext.Provider value={{ brightness, setBrightness }}>
      {children}
    </BrightnessContext.Provider>
  );
};

export const useBrightness = () => {
  const context = useContext(BrightnessContext);
  if (context === undefined) {
    throw new Error('useBrightness must be used within a BrightnessProvider');
  }
  return context;
}; 