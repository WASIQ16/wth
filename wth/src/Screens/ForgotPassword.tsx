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
import { forgotPassword } from '../api/auth';

const ForgotPassword = () => {
    const navigation = useAppNavigation();
    const { isDarkMode } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const data = await forgotPassword(email);
            setLoading(false);
            setEmailSent(true);

            // Show success message
            Alert.alert(
                'Email Sent',
                'If an account with that email exists, a password reset code has been sent. Please check your email.',
                [
                    {
                        text: 'Enter Reset Code',
                        onPress: () => navigation.navigate('ResetPassword')
                    }
                ]
            );
        } catch (error: any) {
            setLoading(false);
            const message = error.message || (error.errors && error.errors[0]?.msg) || 'Failed to send reset email';
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
                        <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Forgot Password?</Text>
                        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
                            Enter your email address and we'll send you a code to reset your password.
                        </Text>
                    </View>

                    {/* Input Field */}
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
                            editable={!emailSent}
                        />

                        <TouchableOpacity
                            style={[styles.actionBtn, emailSent && styles.disabledBtn]}
                            onPress={handleSubmit}
                            disabled={loading || emailSent}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.actionBtnText}>
                                    {emailSent ? 'Email Sent' : 'Send Reset Code'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        {emailSent && (
                            <TouchableOpacity
                                style={styles.secondaryBtn}
                                onPress={() => navigation.navigate('ResetPassword')}
                            >
                                <Text style={[styles.secondaryBtnText, isDarkMode && styles.darkLinkText]}>
                                    I have a reset code
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Footer Links */}
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={[styles.footerText, isDarkMode && styles.darkSubtitle]}>
                                Remember your password? <Text style={[styles.linkText, isDarkMode && styles.darkLinkText]}>Login</Text>
                            </Text>
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
    },
    disabledBtn: {
        backgroundColor: '#68BA7F',
        opacity: 0.7,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        marginTop: 15,
        alignItems: 'center',
        padding: 10,
    },
    secondaryBtnText: {
        color: '#68BA7F',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: 'auto',
    },
    footerText: {
        fontSize: 14,
        color: '#666',
    },
    linkText: {
        color: '#68BA7F',
        fontWeight: 'bold',
    },
    darkLinkText: {
        color: '#68BA7F',
    },
});

export default ForgotPassword;
