import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For Android Emulator: http://10.0.2.2:5000/api
// For Physical Device: Use your machine's local IP
const BASE_URL = 'http://192.168.18.31:5000/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token to requests
apiClient.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('user_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;
