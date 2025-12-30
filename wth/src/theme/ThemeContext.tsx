import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Colors } from './Colors';

export type ThemeContextType = {
    isDarkMode: boolean;
    toggleTheme: () => void;
    colors: typeof Colors;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode((prev: boolean) => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors: Colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
