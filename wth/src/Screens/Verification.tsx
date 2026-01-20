import React, { useState, useEffect } from 'react';
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
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAppNavigation } from '../navigation/NavigationContext';
import { useTheme } from '../theme/ThemeContext';
import { signupUser, sendSignupOTP } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Verification = ({ route }: any) => {
    const { name, email, password } = route.params;
    const navigation = useAppNavigation();
    const { isDarkMode } = useTheme();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerifyAndSignup = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const data = await signupUser(name, email, password, otp);

            // Store token securely
            await AsyncStorage.setItem('user_token', data.token);
            await AsyncStorage.setItem('user_data', JSON.stringify(data.user));

            setLoading(false);
            Alert.alert('Success', 'Account created successfully!', [
                { text: 'Start Exploring', onPress: () => navigation.replace('Home') },
            ]);
        } catch (error: any) {
            setLoading(false);
            const message = error.message || 'Verification failed. Please check the OTP.';
            Alert.alert('Verification Failed', message);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            await sendSignupOTP(email);
            setTimer(60);
            setCanResend(false);
            Alert.alert('Success', 'A new OTP has been sent to your email.');
        } catch (error: any) {
            Alert.alert('Error', 'Failed to resend OTP. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#0F172A' : '#F8FAFC'} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color={isDarkMode ? "#F8FAFC" : "#1E293B"} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Verify Email</Text>
                        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
                            We've sent a 6-digit code to {email}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Enter OTP</Text>
                            <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
                                <MaterialIcons name="security" size={20} color={isDarkMode ? "#94A3B8" : "#9CA3AF"} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, isDarkMode && styles.darkInput]}
                                    placeholder="000000"
                                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={otp}
                                    onChangeText={setOtp}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.actionBtn, (loading || otp.length !== 6) && styles.disabledBtn]}
                            onPress={handleVerifyAndSignup}
                            disabled={loading || otp.length !== 6}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.actionBtnText}>Verify & Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.resendContainer}>
                            <Text style={[styles.resendText, isDarkMode && styles.darkResendText]}>
                                {canResend ? "Didn't receive the code?" : `Resend code in ${timer}s`}
                            </Text>
                            {canResend && (
                                <TouchableOpacity onPress={handleResendOTP}>
                                    <Text style={styles.linkText}>Resend OTP</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    darkContainer: { backgroundColor: '#0F172A' },
    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        marginBottom: 24,
        elevation: 1,
    },
    header: { marginBottom: 32 },
    title: { fontSize: 32, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
    darkTitle: { color: '#F8FAFC' },
    subtitle: { fontSize: 16, color: '#64748B' },
    darkSubtitle: { color: '#94A3B8' },
    form: { marginBottom: 32 },
    inputWrapper: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginLeft: 4 },
    darkLabel: { color: '#CBD5E1' },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 56,
        paddingHorizontal: 16,
    },
    darkInputContainer: { backgroundColor: '#1E293B', borderColor: '#334155' },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: '#1E293B', height: '100%' },
    darkInput: { color: '#F8FAFC' },
    actionBtn: {
        backgroundColor: '#2E8B57',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 8,
    },
    actionBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    disabledBtn: { opacity: 0.6, backgroundColor: '#94A3B8' },
    resendContainer: { marginTop: 24, alignItems: 'center' },
    resendText: { fontSize: 15, color: '#64748B', marginBottom: 8 },
    darkResendText: { color: '#94A3B8' },
    linkText: { color: '#2E8B57', fontSize: 15, fontWeight: '700' },
});

export default Verification;
