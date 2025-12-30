import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppNavigation } from '../navigation/NavigationContext';

const { width } = Dimensions.get('window');

const Splash = () => {
    const navigation = useAppNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Start Animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Check Session and Navigate
        const checkSession = async () => {
            try {
                const token = await AsyncStorage.getItem('user_token');
                // Give some time for splash animation
                setTimeout(() => {
                    if (token) {
                        navigation.replace('Home');
                    } else {
                        navigation.replace('Onboarding');
                    }
                }, 2000);
            } catch (e) {
                navigation.replace('Onboarding');
            }
        };

        checkSession();
    }, [fadeAnim, navigation, scaleAnim]);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Image
                    source={require('../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.brandName}>WTH Services</Text>
            </Animated.View>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Professional Home Services</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: width * 0.6,
        height: width * 0.6,
        marginBottom: 20,
    },
    brandName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#253D2C', // Using brand color
        letterSpacing: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
    },
    footerText: {
        fontSize: 14,
        color: '#888',
        letterSpacing: 1,
    },
});

export default Splash;