import { createContext, useContext, useState, useEffect, useRef } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children, storageKey = 'gkr-theme', applyToDocument = false }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(storageKey) || 'dark';
  });

  const containerRef = useRef(null);

  useEffect(() => {
    if (applyToDocument) {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey, applyToDocument]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, containerRef }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
