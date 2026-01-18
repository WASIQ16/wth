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
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAppNavigation } from '../navigation/NavigationContext';
import { useTheme } from '../theme/ThemeContext';
import { resetPasswordWithToken } from '../api/auth';

const ResetPassword = () => {
    const navigation = useAppNavigation();
    const { isDarkMode } = useTheme();
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!token || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await resetPasswordWithToken(token, newPassword);
            setLoading(false);

            Alert.alert(
                'Success',
                'Your password has been reset successfully. You can now login with your new password.',
                [
                    {
                        text: 'Go to Login',
                        onPress: () => navigation.replace('Login')
                    }
                ]
            );
        } catch (error: any) {
            setLoading(false);
            const message = error.message || (error.errors && error.errors[0]?.msg) || 'Failed to reset password';
            Alert.alert('Error', message);
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

                    {/* Header Section */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialIcons name="arrow-back" size={24} color={isDarkMode ? "#F8FAFC" : "#1E293B"} />
                        </TouchableOpacity>

                        <View style={styles.headerTextContainer}>
                            <Text style={[styles.title, isDarkMode && styles.darkTitle]}>New Password</Text>
                            <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
                                Please enter the reset code you received and your new password
                            </Text>
                        </View>
                    </View>

                    {/* Form Section */}
                    <View style={styles.form}>
                        {/* Token Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Reset Code</Text>
                            <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
                                <MaterialIcons name="vpn-key" size={20} color={isDarkMode ? "#94A3B8" : "#9CA3AF"} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, isDarkMode && styles.darkInput]}
                                    placeholder="Enter reset code"
                                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                                    autoCapitalize="none"
                                    value={token}
                                    onChangeText={setToken}
                                />
                            </View>
                        </View>

                        {/* New Password Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, isDarkMode && styles.darkLabel]}>New Password</Text>
                            <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
                                <MaterialIcons name="lock" size={20} color={isDarkMode ? "#94A3B8" : "#9CA3AF"} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, isDarkMode && styles.darkInput]}
                                    placeholder="Enter new password"
                                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                                    secureTextEntry={!isNewPasswordVisible}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                                    style={styles.eyeIcon}
                                >
                                    <MaterialIcons
                                        name={isNewPasswordVisible ? "visibility" : "visibility-off"}
                                        size={20}
                                        color={isDarkMode ? "#94A3B8" : "#9CA3AF"}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Confirm New Password</Text>
                            <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
                                <MaterialIcons name="lock_clock" size={20} color={isDarkMode ? "#94A3B8" : "#9CA3AF"} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, isDarkMode && styles.darkInput]}
                                    placeholder="Confirm new password"
                                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                                    secureTextEntry={!isConfirmPasswordVisible}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                    style={styles.eyeIcon}
                                >
                                    <MaterialIcons
                                        name={isConfirmPasswordVisible ? "visibility" : "visibility-off"}
                                        size={20}
                                        color={isDarkMode ? "#94A3B8" : "#9CA3AF"}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.actionBtnText}>Update Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer Section */}
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.linkText}>Didn't receive a code? Resend</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backToLoginBtn}
                            onPress={() => navigation.replace('Login')}
                        >
                            <Text style={[styles.backText, isDarkMode && styles.darkBackText]}>Back to Login</Text>
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
        backgroundColor: '#F8FAFC', // Slate 50
    },
    darkContainer: {
        backgroundColor: '#0F172A', // Slate 900
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    header: {
        marginBottom: 32,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        marginBottom: 24,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    headerTextContainer: {
        marginTop: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1E293B', // Slate 800
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    darkTitle: {
        color: '#F8FAFC',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B', // Slate 500
        lineHeight: 24,
    },
    darkSubtitle: {
        color: '#94A3B8',
    },
    form: {
        marginBottom: 32,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155', // Slate 700
        marginBottom: 8,
        marginLeft: 4,
    },
    darkLabel: {
        color: '#CBD5E1', // Slate 300
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0', // Slate 200
        height: 56,
        paddingHorizontal: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    darkInputContainer: {
        backgroundColor: '#1E293B', // Slate 800
        borderColor: '#334155', // Slate 700
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        height: '100%',
    },
    darkInput: {
        color: '#F8FAFC',
    },
    eyeIcon: {
        padding: 8,
    },
    actionBtn: {
        backgroundColor: '#2E8B57',
        height: 56,
        borderRadius: 28, // Pill shape
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#2E8B57',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    actionBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    linkText: {
        color: '#2E8B57',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 24,
    },
    backToLoginBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    backText: {
        fontSize: 15,
        color: '#64748B',
        fontWeight: '500',
    },
    darkBackText: {
        color: '#94A3B8',
    },
});

export default ResetPassword;
