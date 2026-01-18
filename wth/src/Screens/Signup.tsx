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
import { signupUser } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Signup = () => {
    const navigation = useAppNavigation();
    const { isDarkMode } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Full Name, Email and Password are required');
            return;
        }

        setLoading(true);
        try {
            const data = await signupUser(name, email, password);

            // Store token securely
            await AsyncStorage.setItem('user_token', data.token);
            await AsyncStorage.setItem('user_data', JSON.stringify(data.user));

            setLoading(false);
            Alert.alert('Success', 'Account created successfully!', [
                { text: 'Start Exploring', onPress: () => navigation.replace('Home') },
            ]);
        } catch (error: any) {
            setLoading(false);
            const message = error.message || (error.errors && error.errors[0]?.msg) || 'Something went wrong';
            Alert.alert('Signup Failed', message);
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
                            <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Create Account</Text>
                            <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>Join WTH Services for free</Text>
                        </View>
                    </View>

                    {/* Form Section */}
                    <View style={styles.form}>
                        {/* Name Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Full Name</Text>
                            <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
                                <MaterialIcons name="person" size={20} color={isDarkMode ? "#94A3B8" : "#9CA3AF"} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, isDarkMode && styles.darkInput]}
                                    placeholder="John Doe"
                                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Email Address</Text>
                            <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
                                <MaterialIcons name="email" size={20} color={isDarkMode ? "#94A3B8" : "#9CA3AF"} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, isDarkMode && styles.darkInput]}
                                    placeholder="name@example.com"
                                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Password</Text>
                            <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
                                <MaterialIcons name="lock" size={20} color={isDarkMode ? "#94A3B8" : "#9CA3AF"} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, isDarkMode && styles.darkInput]}
                                    placeholder="Create a password"
                                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                                    secureTextEntry={!isPasswordVisible}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                    style={styles.eyeIcon}
                                >
                                    <MaterialIcons
                                        name={isPasswordVisible ? "visibility" : "visibility-off"}
                                        size={20}
                                        color={isDarkMode ? "#94A3B8" : "#9CA3AF"}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.actionBtnText}>Sign Up</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer Section */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, isDarkMode && styles.darkFooterText]}>
                            Already have an account?
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.linkText}>Sign In</Text>
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
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 20,
    },
    footerText: {
        fontSize: 15,
        color: '#64748B',
        marginRight: 6,
    },
    darkFooterText: {
        color: '#94A3B8',
    },
    linkText: {
        color: '#2E8B57',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default Signup;
