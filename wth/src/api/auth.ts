import apiClient from './client';

export const loginUser = async (email: string, password: string): Promise<any> => {
    console.log('📡 Calling Login API:', { email });
    try {
        const response = await apiClient.post('/auth/login', { email, password });
        console.log('✅ Login Response:', response.status);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error('❌ Login API Error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('❌ Login Network Error: No response received from server at', (apiClient.defaults.baseURL || 'unknown_base_url'));
        } else {
            console.error('❌ Login Request Error:', error.message);
        }
        throw error.response?.data || { message: error.message || 'Login failed' };
    }
};

export const signupUser = async (fullName: string, email: string, password: string): Promise<any> => {
    console.log('📡 Calling Signup API:', { fullName, email });
    try {
        const response = await apiClient.post('/auth/signup', { fullName, email, password });
        console.log('✅ Signup Response:', response.status);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error('❌ Signup API Error:', error.response.status, error.response.data);
        } else if (error.request) {
            // Assuming BASE_URL is defined elsewhere or imported, e.g., from a config file
            console.error('❌ Signup Network Error: No response received from server at', (apiClient.defaults.baseURL || 'unknown_base_url'));
        } else {
            console.error('❌ Signup Request Error:', error.message);
        }
        throw error.response?.data || { message: error.message || 'Signup failed' };
    }
};

export const getProfile = async (): Promise<any> => {
    console.log('📡 Fetching User Profile...');
    try {
        const response = await apiClient.get('/auth/user');
        return response.data;
    } catch (error: any) {
        console.error('❌ Get Profile API Error:', error.response?.status);
        throw error.response?.data || { message: 'Failed to fetch profile' };
    }
};

export const resetPassword = async (currentPassword: string, newPassword: string): Promise<any> => {
    console.log('📡 Calling Reset Password API...');
    try {
        const response = await apiClient.put('/auth/reset-password', { currentPassword, newPassword });
        return response.data;
    } catch (error: any) {
        console.error('❌ Reset Password API Error:', error.response?.status, error.response?.data);
        throw error.response?.data || { message: 'Failed to reset password' };
    }
};
