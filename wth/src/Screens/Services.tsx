import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    { name: 'Painting', icon: '🎨' },
    { name: 'AC Service', icon: '❄️' },
    { name: 'Plumbing', icon: '🔧' },
    { name: 'Electrician', icon: '⚡' },
    { name: 'Cleaning', icon: '🧹' },
    { name: 'Carpentry', icon: '🪚' },
    { name: 'Others', icon: '⋯' },
];

const Services = ({ routeParams }: { routeParams?: any }) => {
    const { goBack } = useAppNavigation();
    const { isDarkMode } = useTheme();
    const [problemText, setProblemText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [selectedService, setSelectedService] = useState({ name: 'Select a Service', icon: '' });
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
        const partialResultsSubscription = addEventListener('onSpeechPartialResults', (e: any) => {
            if (e.value) setProblemText(e.value);
        });

        return () => {
            destroy().then(() => {
                startSubscription.remove();
                endSubscription.remove();
                errorSubscription.remove();
                resultsSubscription.remove();
                partialResultsSubscription.remove();
            });
        };
    }, []);

    const toggleListening = async () => {
        try {
            if (isListening) {
                await stopListening();
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
            <View style={[styles.header, isDarkMode && styles.darkHeader]}>
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Text style={[styles.backText, isDarkMode && styles.darkText]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Services</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Identical Input Section as Home */}
                <View style={styles.inputSection}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Describe the problem</Text>
                    <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
                        <TextInput
                            style={[styles.textInput, isDarkMode && styles.darkTextInput]}
                            placeholder={isListening ? "Listening..." : "Type the problem..."}
                            placeholderTextColor={isDarkMode ? "#666" : "#999"}
                            multiline
                            value={problemText}
                            onChangeText={setProblemText}
                        />
                        <TouchableOpacity
                            style={[styles.micButton, isListening && styles.micButtonActive, isDarkMode && styles.darkMicButton]}
                            onPress={toggleListening}
                        >
                            <Text style={styles.micIcon}>{isListening ? '🛑' : '🎤'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Dropdown Section */}
                <View style={styles.dropdownSection}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Select Service</Text>
                    <TouchableOpacity
                        style={[styles.dropdownHeader, isDarkMode && styles.darkInputContainer]}
                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <View style={styles.dropdownHeaderContent}>
                            {selectedService.icon ? <Text style={styles.serviceIcon}>{selectedService.icon} </Text> : null}
                            <Text style={[styles.dropdownHeaderText, isDarkMode && styles.darkText]}>{selectedService.name}</Text>
                        </View>
                        <Text style={[styles.arrowIcon, isDarkMode && styles.darkText]}>{isDropdownOpen ? '▲' : '▼'}</Text>
                    </TouchableOpacity>

                    {isDropdownOpen && (
                        <View style={[styles.dropdownList, isDarkMode && styles.darkDropdownList]}>
                            {SERVICES.map((service) => (
                                <TouchableOpacity
                                    key={service.name}
                                    style={styles.dropdownItem}
                                    onPress={() => handleSelectService(service)}
                                >
                                    <View style={styles.dropdownItemContent}>
                                        <Text style={styles.serviceIcon}>{service.icon}</Text>
                                        <Text style={[styles.dropdownItemText, isDarkMode && styles.darkText]}> {service.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.submitButton}
                    onPress={() => Alert.alert('Model Training', 'Ask Ahmad to Train Model')}>
                    <Text style={styles.submitButtonText}>Request Service</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    darkContainer: {
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    darkHeader: {
        backgroundColor: '#0A0A0A',
        borderBottomColor: '#1F1F1F',
    },
    backButton: {
        marginRight: 15,
    },
    backText: {
        fontSize: 24,
        color: '#68BA7F',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#253D2C',
    },
    content: {
        padding: 20,
    },
    inputSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
        color: '#2C3E50',
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 10,
        height: 120,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    darkInputContainer: {
        backgroundColor: '#0A0A0A',
        borderColor: '#1F1F1F',
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        textAlignVertical: 'top',
        height: '100%',
    },
    darkTextInput: {
        color: '#FFFFFF',
    },
    micButton: {
        padding: 10,
        backgroundColor: '#68BA7F22',
        borderRadius: 50,
        marginLeft: 10,
    },
    darkMicButton: {
        backgroundColor: '#1A1A1A',
    },
    micButtonActive: {
        backgroundColor: '#FFEBEE',
        borderColor: '#FF5252',
        borderWidth: 1,
    },
    micIcon: {
        fontSize: 20,
    },
    dropdownSection: {
        marginBottom: 30,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    dropdownHeaderText: {
        fontSize: 16,
        color: '#68BA7F',
        fontWeight: '500',
    },
    dropdownHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceIcon: {
        fontSize: 20,
    },
    arrowIcon: {
        fontSize: 12,
        color: '#666',
    },
    dropdownList: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
    },
    darkDropdownList: {
        backgroundColor: '#0A0A0A',
        borderColor: '#1F1F1F',
    },
    dropdownItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F9F9F9',
    },
    dropdownItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#253D2C',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    darkText: {
        color: '#FFFFFF',
    },
});

export default Services;
