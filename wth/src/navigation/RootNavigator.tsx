import React, { useState } from 'react';
import { View } from 'react-native';
import { RouteName, Route } from './NavigationTypes';
import { NavigationContext } from './NavigationContext';
import Home from '../Screens/home';
import Report from '../Screens/report';
import Result from '../Screens/result';
import Splash from '../Screens/Splash';
import Onboarding from '../Screens/Onboarding';
import Login from '../Screens/Login';
import Signup from '../Screens/Signup';
import Profile from '../Screens/Profile';
import Services from '../Screens/Services';

export default function RootNavigator() {
  const [stack, setStack] = useState<Route[]>([{ name: 'Splash' }]);

  const navigate = (name: RouteName, params?: any) => {
    setStack((s) => [...s, { name, params }]);
  };

  const replace = (name: RouteName, params?: any) => {
    setStack((s) => {
      const newStack = [...s];
      newStack[newStack.length - 1] = { name, params };
      return newStack;
    });
  };

  const goBack = () => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  };

  const top = stack[stack.length - 1];

  let Screen: React.ReactNode = null;
  switch (top.name) {
    case 'Splash':
      Screen = <Splash />;
      break;
    case 'Onboarding':
      Screen = <Onboarding />;
      break;
    case 'Login':
      Screen = <Login />;
      break;
    case 'Signup':
      Screen = <Signup />;
      break;
    case 'Home':
      Screen = <Home />;
      break;
    case 'Report':
      Screen = <Report />;
      break;
    case 'Result':
      Screen = <Result routeParams={top.params} />;
      break;
    case 'Profile':
      Screen = <Profile />;
      break;
    case 'Services':
      Screen = <Services routeParams={top.params} />;
      break;
    default:
      Screen = <Home />;
  }

  return (
    <NavigationContext.Provider value={{ navigate, replace, goBack }}>
      <View style={{ flex: 1 }}>{Screen}</View>
    </NavigationContext.Provider>
  );
}
