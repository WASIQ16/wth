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
export const updateProfile = async (fullName: string): Promise<any> => {
    console.log('📡 Calling Update Profile API...', { fullName });
    try {
        const response = await apiClient.put('/auth/update-profile', { fullName });
        return response.data;
    } catch (error: any) {
        console.error('❌ Update Profile API Error:', error.response?.status, error.response?.data);
        throw error.response?.data || { message: 'Failed to update profile' };
    }
};

export const uploadProfileImage = async (formData: FormData): Promise<any> => {
    console.log('📡 Calling Upload Avatar API...');
    try {
        const response = await apiClient.post('/auth/upload-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        console.log('✅ Upload Avatar Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Upload Avatar API Error:', error.response?.status, error.response?.data);
        console.error('❌ Full Error Object:', JSON.stringify(error.response?.data, null, 2));
        console.error('❌ Error Message:', error.message);
        throw error.response?.data || { message: 'Failed to upload image' };
    }
};

export const forgotPassword = async (email: string): Promise<any> => {
    console.log('📡 Calling Forgot Password API...', { email });
    try {
        const response = await apiClient.post('/auth/forgot-password', { email });
        console.log('✅ Forgot Password Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Forgot Password API Error:', error.response?.status, error.response?.data);
        throw error.response?.data || { message: 'Failed to send reset email' };
    }
};

export const verifyResetToken = async (token: string): Promise<any> => {
    console.log('📡 Calling Verify Reset Token API...');
    try {
        const response = await apiClient.post('/auth/verify-reset-token', { token });
        return response.data;
    } catch (error: any) {
        console.error('❌ Verify Reset Token API Error:', error.response?.status, error.response?.data);
        throw error.response?.data || { message: 'Invalid or expired token' };
    }
};

export const resetPasswordWithToken = async (token: string, newPassword: string): Promise<any> => {
    console.log('📡 Calling Reset Password API...');
    try {
        const response = await apiClient.post('/auth/reset-password', { token, newPassword });
        console.log('✅ Reset Password Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Reset Password API Error:', error.response?.status, error.response?.data);
        throw error.response?.data || { message: 'Failed to reset password' };
    }
};

export const checkEmailExists = async (email: string): Promise<any> => {
    try {
        const response = await apiClient.post('/auth/check-email', { email });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Email check failed' };
    }
};
