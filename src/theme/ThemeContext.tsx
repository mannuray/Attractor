import React, { createContext, useContext, useState } from "react";

import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { themes, ThemeColors } from './themes';

interface ThemeContextType {
  currentTheme: string;
  setTheme: (themeName: string) => void;
  availableThemes: { id: string; label: string }[];
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    // Server rendering (prerender) and blocked storage both fall back to the default theme.
    try {
      return (typeof window !== 'undefined' && window.localStorage.getItem('app-theme')) || 'cyber_cyan';
    } catch {
      return 'cyber_cyan';
    }
  });

  const setTheme = (name: string) => {
    if (themes[name]) {
      setThemeName(name);
      try { localStorage.setItem('app-theme', name); } catch { /* storage unavailable */ }
    }
  };

  const availableThemes = Object.keys(themes).map(id => ({
    id,
    label: themes[id].label
  }));

  const currentThemeData = themes[themeName] || themes.cyber_cyan;

  return (
    <ThemeContext.Provider value={{ 
      currentTheme: themeName, 
      setTheme, 
      availableThemes,
      colors: currentThemeData.colors 
    }}>
      <StyledThemeProvider theme={currentThemeData.colors}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
