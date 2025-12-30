import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppNavigation } from '../navigation/NavigationContext';
import { useTheme } from '../theme/ThemeContext';
import { loginUser } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
    const navigation = useAppNavigation();
    const { isDarkMode } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            const data = await loginUser(email, password);

            // Store token securely
            await AsyncStorage.setItem('user_token', data.token);
            await AsyncStorage.setItem('user_data', JSON.stringify(data.user));

            setLoading(false);
            navigation.replace('Home');
        } catch (error: any) {
            setLoading(false);
            const message = error.message || (error.errors && error.errors[0]?.msg) || 'Invalid login details';
            Alert.alert('Login Failed', message);
        }
    };

    const handleForgotPassword = () => {
        Alert.alert('Forgot Password', 'Reset password flow would go here.');
    };

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Welcome Back</Text>
                        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>Login to your account</Text>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.form}>
                        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Email Address</Text>
                        <TextInput
                            style={[styles.input, isDarkMode && styles.darkInput]}
                            placeholder="john@example.com"
                            placeholderTextColor={isDarkMode ? "#666" : "#999"}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Password</Text>
                        <TextInput
                            style={[styles.input, isDarkMode && styles.darkInput]}
                            placeholder="••••••••"
                            placeholderTextColor={isDarkMode ? "#666" : "#999"}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
                            <Text style={[styles.forgotText, isDarkMode && styles.darkLinkText]}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.actionBtnText}>Login</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer Links */}
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={[styles.footerText, isDarkMode && styles.darkSubtitle]}>
                                Don't have an account? <Text style={[styles.linkText, isDarkMode && styles.darkLinkText]}>Sign Up</Text>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.guestBtn}
                            onPress={() => navigation.replace('Home')}
                        >
                            <Text style={styles.guestText}>Continue as Guest</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    darkContainer: {
        backgroundColor: '#000',
    },
    scrollContent: {
        padding: 24,
        flexGrow: 1,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#253D2C',
        marginBottom: 10,
    },
    darkTitle: {
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    darkSubtitle: {
        color: '#888',
    },
    form: {
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginLeft: 4,
    },
    darkLabel: {
        color: '#E0E0E0',
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
    },
    darkInput: {
        backgroundColor: '#0A0A0A',
        borderColor: '#1F1F1F',
        color: '#FFF',
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotText: {
        color: '#68BA7F',
        fontWeight: '600',
    },
    actionBtn: {
        backgroundColor: '#253D2C',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#253D2C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        alignItems: 'center',
        marginTop: 'auto',
    },
    footerText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    linkText: {
        color: '#68BA7F',
        fontWeight: 'bold',
    },
    darkLinkText: {
        color: '#68BA7F',
    },
    guestBtn: {
        padding: 10,
    },
    guestText: {
        color: '#888',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default Login;
