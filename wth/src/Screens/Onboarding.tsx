import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppNavigation } from '../navigation/NavigationContext';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: 1,
        title: 'Describe your problem',
        description: 'Simply tell us what needs fixing in text or voice. No complicated forms.',
        image: require('../assets/plumber.jpg'),
    },
    {
        id: 2,
        title: 'AI identifies the service',
        description: 'Our smart AI analyzes your request and matches you with the right professionals.',
        image: require('../assets/ac-Clean.jpg'),
    },
    {
        id: 3,
        title: 'Get instant estimates',
        description: 'See price ranges and book services easily within minutes.',
        image: require('../assets/paint.jpg'),
    },
];

const Onboarding = () => {
    const navigation = useAppNavigation();
    const { isDarkMode } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            navigation.replace('Login');
        }
    };

    const handleSkip = () => {
        navigation.replace('Login');
    };

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <View style={styles.contentContainer}>
                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={slides[currentIndex].image}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={[styles.title, isDarkMode && styles.darkText]}>{slides[currentIndex].title}</Text>
                    <Text style={[styles.description, isDarkMode && styles.darkSubText]}>{slides[currentIndex].description}</Text>
                </View>

                {/* Paginator */}
                <View style={styles.paginator}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                { backgroundColor: index === currentIndex ? '#68BA7F' : '#ccc' },
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                    <Text style={[styles.skipText, isDarkMode && styles.darkSubText]}>Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                    <Text style={styles.nextText}>
                        {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
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
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    imageContainer: {
        width: width * 0.8,
        height: width * 0.8, // Square aspect ratio
        borderRadius: 20,
        marginBottom: 40,
        overflow: 'hidden',
        elevation: 5, // Shadow for android
        backgroundColor: '#f0f4f8',
    },
    darkImageContainer: {
        backgroundColor: '#1A1A1A',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    darkText: {
        color: '#FFF',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    darkSubText: {
        color: '#888',
    },
    paginator: {
        flexDirection: 'row',
        marginTop: 40,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 40, // Add padding for bottom safe area
    },
    skipButton: {
        padding: 15,
    },
    skipText: {
        fontSize: 16,
        color: '#888',
    },
    nextButton: {
        backgroundColor: '#68BA7F',
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    nextText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Onboarding;
