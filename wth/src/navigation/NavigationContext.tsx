import { createContext, useContext } from 'react';
import { AppNav } from './NavigationTypes';

export const NavigationContext = createContext<AppNav | undefined>(undefined);

export const useAppNavigation = () => {
    const ctx = useContext(NavigationContext);
    if (!ctx) throw new Error('useAppNavigation must be used within RootNavigator');
    return ctx;
};
