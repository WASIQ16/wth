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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            await forgotPassword(email);
            setLoading(false);
            setEmailSent(true);

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
                            <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Forgot Password?</Text>
                            <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
                                Don't worry, it happens. Enter your email and we'll send you a reset code.
                            </Text>
                        </View>
                    </View>

                    {/* Form Section */}
                    <View style={styles.form}>
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Email Address</Text>
                            <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
                                <MaterialIcons name="email" size={20} color={isDarkMode ? "#94A3B8" : "#9CA3AF"} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, isDarkMode && styles.darkInput]}
                                    placeholder="john@example.com"
                                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    editable={!emailSent}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.actionBtn, emailSent && styles.disabledBtn]}
                            onPress={handleSubmit}
                            disabled={loading || emailSent}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.actionBtnText}>
                                    {emailSent ? 'Code Sent' : 'Send Reset Code'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        {emailSent && (
                            <TouchableOpacity
                                style={styles.secondaryBtn}
                                onPress={() => navigation.navigate('ResetPassword')}
                            >
                                <Text style={styles.secondaryBtnText}>
                                    I have a reset code
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Footer Section */}
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={[styles.footerText, isDarkMode && styles.darkSubtitle]}>
                                Remember your password? <Text style={styles.linkText}>Login</Text>
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
        backgroundColor: '#F8FAFC',
    },
    darkContainer: {
        backgroundColor: '#0F172A',
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
        color: '#1E293B',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    darkTitle: {
        color: '#F8FAFC',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        lineHeight: 24,
    },
    darkSubtitle: {
        color: '#94A3B8',
    },
    form: {
        marginBottom: 32,
    },
    inputWrapper: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
        marginLeft: 4,
    },
    darkLabel: {
        color: '#CBD5E1',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 56,
        paddingHorizontal: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    darkInputContainer: {
        backgroundColor: '#1E293B',
        borderColor: '#334155',
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
    actionBtn: {
        backgroundColor: '#2E8B57',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2E8B57',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    disabledBtn: {
        backgroundColor: '#94A3B8',
        shadowOpacity: 0.1,
        elevation: 2,
    },
    actionBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    secondaryBtn: {
        marginTop: 20,
        alignItems: 'center',
        paddingVertical: 12,
    },
    secondaryBtnText: {
        color: '#2E8B57',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 20,
    },
    footerText: {
        fontSize: 15,
        color: '#64748B',
    },
    linkText: {
        color: '#2E8B57',
        fontWeight: '700',
    },
});

export default ForgotPassword;
