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
import { signupUser } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Signup = () => {
    const navigation = useAppNavigation();
    const { isDarkMode } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={[styles.backButtonText, isDarkMode && styles.darkBackText]}>← Back</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Create Account</Text>
                        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>Join WTH Services today</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, isDarkMode && styles.darkInput]}
                            placeholder="John Doe"
                            placeholderTextColor={isDarkMode ? "#666" : "#999"}
                            value={name}
                            onChangeText={setName}
                        />

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

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.footerText, isDarkMode && styles.darkSubtitle]}>
                                Already have an account? <Text style={[styles.linkText, isDarkMode && styles.darkLinkText]}>Login</Text>
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
    },
    backButton: {
        marginBottom: 20,
    },
    backButtonText: {
        fontSize: 16,
        color: '#68BA7F',
    },
    darkBackText: {
        color: '#68BA7F',
    },
    header: {
        marginBottom: 40,
        marginTop: 20,
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
        paddingBottom: 20,
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

export default Signup;
