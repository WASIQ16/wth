export type RouteName = 'Home' | 'Report' | 'Result' | 'Services' | 'Splash' | 'Onboarding' | 'Login' | 'Signup' | 'Profile' | 'ForgotPassword' | 'ResetPassword' | 'Verification';
export type Route = { name: RouteName; params?: any };

export type AppNav = {
    navigate: (name: RouteName, params?: any) => void;
    replace: (name: RouteName, params?: any) => void;
    goBack: () => void;
};
