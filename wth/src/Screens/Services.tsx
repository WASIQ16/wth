import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
    startListening,
    stopListening,
    destroy,
    addEventListener,
    setRecognitionLanguage,
} from '@ascendtis/react-native-voice-to-text';
import { useAppNavigation } from '../navigation/NavigationContext';
import { useTheme } from '../theme/ThemeContext';

const SERVICES = [
    { name: 'Painting', icon: 'format-paint' },
    { name: 'AC Service', icon: 'ac-unit' },
    { name: 'Plumbing', icon: 'plumbing' },
    { name: 'Electrician', icon: 'electrical-services' },
    { name: 'Cleaning', icon: 'cleaning-services' },
    { name: 'Carpentry', icon: 'carpenter' },
    { name: 'Others', icon: 'more-horiz' },
];

const Services = ({ routeParams }: { routeParams?: any }) => {
    const { goBack } = useAppNavigation();
    const { isDarkMode } = useTheme();
    const [problemText, setProblemText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [selectedService, setSelectedService] = useState({ name: 'Select a Service', icon: 'help-outline' });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (routeParams?.serviceName) {
            const initial = SERVICES.find(s => s.name === routeParams.serviceName);
            if (initial) {
                setSelectedService(initial);
            }
        }
    }, [routeParams]);

    useEffect(() => {
        const startSubscription = addEventListener('onSpeechStart', () => setIsListening(true));
        const endSubscription = addEventListener('onSpeechEnd', () => setIsListening(false));
        const errorSubscription = addEventListener('onSpeechError', (e: any) => {
            setIsListening(false);
            if (e.message !== 'No speech match found' && e.message !== 'Speech timeout') {
                Alert.alert('Speech Recognition Error', e.message || 'Something went wrong');
            }
        });
        const resultsSubscription = addEventListener('onSpeechResults', (e: any) => {
            if (e.value) setProblemText(e.value);
        });

        return () => {
            destroy().then(() => {
                startSubscription.remove();
                endSubscription.remove();
                errorSubscription.remove();
                resultsSubscription.remove();
            });
        };
    }, []);

    const toggleListening = async () => {
        try {
            if (isListening) {
                await stopListening();
                setIsListening(false);
            } else {
                setProblemText('');
                await setRecognitionLanguage('en-US');
                await startListening();
            }
        } catch (e) {
            Alert.alert('Error', 'Could not start voice recognition');
        }
    };

    const handleSelectService = (service: { name: string, icon: string }) => {
        setSelectedService(service);
        setIsDropdownOpen(false);
    };

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#0F172A' : '#F8FAFC'} />

            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={[styles.headerBtn, isDarkMode && styles.darkHeaderBtn]}>
                    <MaterialIcons name="arrow-back" size={22} color={isDarkMode ? "#F8FAFC" : "#1E293B"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Request Service</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Input Section - Same as Home */}
                <View style={[styles.inputCard, isDarkMode && styles.darkCard]}>
                    <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>Describe the issue</Text>
                    <View style={[styles.inputWrapper, isDarkMode && styles.darkInputWrapper]}>
                        <TextInput
                            style={[styles.textInput, isDarkMode && styles.darkText]}
                            placeholder={isListening ? "Listening..." : "Tell us what's wrong..."}
                            placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                            multiline
                            value={problemText}
                            onChangeText={setProblemText}
                        />
                        <TouchableOpacity
                            style={[styles.micBtn, isListening && styles.micBtnActive]}
                            onPress={toggleListening}
                        >
                            <MaterialIcons name={isListening ? "stop" : "mic"} size={22} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Dropdown Section */}
                <View style={styles.dropdownContainer}>
                    <Text style={[styles.sectionLabel, isDarkMode && styles.darkLabel]}>Required Service</Text>
                    <TouchableOpacity
                        style={[styles.dropdownHeader, isDarkMode && styles.darkCard]}
                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <View style={styles.dropdownHeaderContent}>
                            <View style={[styles.selectedIconBox, isDarkMode && styles.darkIconBox]}>
                                <MaterialIcons name={selectedService.icon} size={20} color="#2E8B57" />
                            </View>
                            <Text style={[styles.dropdownHeaderText, isDarkMode && styles.darkText]}>
                                {selectedService.name}
                            </Text>
                        </View>
                        <MaterialIcons
                            name={isDropdownOpen ? "expand-less" : "expand-more"}
                            size={24}
                            color={isDarkMode ? "#94A3B8" : "#64748B"}
                        />
                    </TouchableOpacity>

                    {isDropdownOpen && (
                        <View style={[styles.dropdownList, isDarkMode && styles.darkCard]}>
                            {SERVICES.map((service) => (
                                <TouchableOpacity
                                    key={service.name}
                                    style={styles.dropdownItem}
                                    onPress={() => handleSelectService(service)}
                                >
                                    <View style={[styles.itemIconBox, isDarkMode && styles.darkIconBox]}>
                                        <MaterialIcons name={service.icon} size={18} color="#2E8B57" />
                                    </View>
                                    <Text style={[styles.dropdownItemText, isDarkMode && styles.darkText]}>
                                        {service.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={() => Alert.alert('Request Sent', 'Our service providers will contact you soon.')}
                >
                    <Text style={styles.submitButtonText}>Confirm Request</Text>
                    <MaterialIcons name="check-circle" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>

                <Text style={styles.disclaimerText}>
                    Our AI will analyze your description to match you with the best provider.
                </Text>
            </ScrollView>
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
    header: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    darkHeaderBtn: { backgroundColor: '#1E293B' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    darkText: { color: '#F8FAFC' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
    inputCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#2E8B57',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 8,
    },
    darkCard: { backgroundColor: '#1E293B' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 16 },
    inputWrapper: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        padding: 12,
        minHeight: 100,
    },
    darkInputWrapper: { backgroundColor: '#0F172A' },
    textInput: { flex: 1, fontSize: 15, color: '#1E293B', textAlignVertical: 'top' },
    micBtn: {
        width: 40,
        height: 40,
        backgroundColor: '#2E8B57',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    micBtnActive: { backgroundColor: '#EF4444' },
    dropdownContainer: { marginBottom: 32 },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        marginBottom: 12,
        letterSpacing: 1,
        marginLeft: 4
    },
    darkLabel: { color: '#64748B' },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        elevation: 2,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
    },
    dropdownHeaderContent: { flexDirection: 'row', alignItems: 'center' },
    selectedIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    darkIconBox: { backgroundColor: '#0F172A' },
    dropdownHeaderText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    dropdownList: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginTop: 8,
        padding: 8,
        elevation: 4,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 14,
    },
    itemIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    dropdownItemText: { fontSize: 15, fontWeight: '600', color: '#334155' },
    submitButton: {
        backgroundColor: '#2E8B57',
        flexDirection: 'row',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2E8B57',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    submitButtonText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
    disclaimerText: {
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 20,
        lineHeight: 18,
        paddingHorizontal: 20,
    },
});

export default Services;
