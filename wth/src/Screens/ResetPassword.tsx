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
import { resetPasswordWithToken } from '../api/auth';

const ResetPassword = () => {
    const navigation = useAppNavigation();
    const { isDarkMode } = useTheme();
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Reset Password</Text>
                        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
                            Enter the reset code from your email and choose a new password.
                        </Text>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.form}>
                        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Reset Code</Text>
                        <TextInput
                            style={[styles.input, isDarkMode && styles.darkInput]}
                            placeholder="Enter reset code from email"
                            placeholderTextColor={isDarkMode ? "#666" : "#999"}
                            autoCapitalize="none"
                            value={token}
                            onChangeText={setToken}
                        />

                        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>New Password</Text>
                        <TextInput
                            style={[styles.input, isDarkMode && styles.darkInput]}
                            placeholder="••••••••"
                            placeholderTextColor={isDarkMode ? "#666" : "#999"}
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />

                        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Confirm New Password</Text>
                        <TextInput
                            style={[styles.input, isDarkMode && styles.darkInput]}
                            placeholder="••••••••"
                            placeholderTextColor={isDarkMode ? "#666" : "#999"}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />

                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.actionBtnText}>Reset Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer Links */}
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={[styles.footerText, isDarkMode && styles.darkSubtitle]}>
                                Didn't receive a code? <Text style={[styles.linkText, isDarkMode && styles.darkLinkText]}>Resend</Text>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => navigation.replace('Login')}
                        >
                            <Text style={[styles.backText, isDarkMode && styles.darkSubtitle]}>Back to Login</Text>
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
        lineHeight: 24,
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
        marginTop: 10,
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
        marginBottom: 15,
    },
    linkText: {
        color: '#68BA7F',
        fontWeight: 'bold',
    },
    darkLinkText: {
        color: '#68BA7F',
    },
    backBtn: {
        padding: 10,
    },
    backText: {
        color: '#888',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default ResetPassword;
