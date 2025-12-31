import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    Switch,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppNavigation } from '../navigation/NavigationContext';
import { useTheme } from '../theme/ThemeContext';
import { launchImageLibrary } from 'react-native-image-picker';
import { getProfile, resetPassword, updateProfile, uploadProfileImage } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
    const navigation = useAppNavigation();
    const [profileImage, setProfileImage] = useState<any>(null);
    const { isDarkMode, toggleTheme } = useTheme();

    // User Info States
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [tempName, setTempName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [isSavingName, setIsSavingName] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [loading, setLoading] = useState(true);

    // Password Reset States
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const data = await getProfile();
            setFullName(data.fullName);
            setTempName(data.fullName);
            setEmail(data.email);
            if (data.profileImage) {
                setProfileImage({ uri: data.profileImage });
            }
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            console.error('Error fetching profile:', error);
            // Fallback to local storage if API fails
            const stored = await AsyncStorage.getItem('user_data');
            if (stored) {
                const userData = JSON.parse(stored);
                setFullName(userData.fullName || '');
                setTempName(userData.fullName || '');
                setEmail(userData.email || '');
            }
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    onPress: async () => {
                        await AsyncStorage.clear();
                        navigation.replace('Login');
                    }
                }
            ]
        );
    };

    const handleSelectImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
        });

        if (result.didCancel) {
            console.log('User cancelled image picker');
        } else if (result.errorCode) {
            console.log('ImagePicker Error: ', result.errorMessage);
            Alert.alert('Error', result.errorMessage || 'Failed to pick image');
        } else if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const source = { uri: asset.uri };

            // Start uploading to Cloudinary via Backend
            setIsUploadingImage(true);
            try {
                const formData = new FormData();
                formData.append('avatar', {
                    uri: asset.uri,
                    type: asset.type || 'image/jpeg',
                    name: asset.fileName || 'profile.jpg',
                } as any);

                console.log('📤 Uploading image with details:', {
                    uri: asset.uri,
                    type: asset.type,
                    fileName: asset.fileName,
                    fileSize: asset.fileSize
                });

                const response = await uploadProfileImage(formData);
                setProfileImage({ uri: response.profileImage });
                Alert.alert('Success', 'Profile image updated successfully');
            } catch (error: any) {
                console.error('Error uploading image:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));

                // Show detailed error message
                const errorMsg = error.error || error.message || 'Failed to upload image';
                const errorCode = error.code ? ` (Code: ${error.code})` : '';
                Alert.alert('Error', `${errorMsg}${errorCode}`);
            } finally {
                setIsUploadingImage(false);
            }
        }
    };

    const handleSaveName = async () => {
        if (!tempName.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        if (tempName === fullName) {
            setIsEditingName(false);
            return;
        }

        setIsSavingName(true);
        try {
            await updateProfile(tempName);
            setFullName(tempName);
            setIsEditingName(false);

            // Update local user data if stored
            const stored = await AsyncStorage.getItem('user_data');
            if (stored) {
                const userData = JSON.parse(stored);
                userData.fullName = tempName;
                await AsyncStorage.setItem('user_data', JSON.stringify(userData));
            }

            Alert.alert('Success', 'Profile name updated successfully');
        } catch (error: any) {
            const message = error.message || 'Failed to update name';
            Alert.alert('Error', message);
            setTempName(fullName);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleCancelName = () => {
        setTempName(fullName);
        setIsEditingName(false);
    };

    const handleResetPassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill all password fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsResetting(true);
        try {
            await resetPassword(currentPassword, newPassword);
            Alert.alert('Success', 'Password has been reset successfully');
            setIsPasswordModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            const message = error.message || 'Failed to reset password';
            Alert.alert('Error', message);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <View style={[styles.header, isDarkMode && styles.darkHeader]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={[styles.backButtonText, isDarkMode && styles.darkBackText]}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDarkMode && styles.darkTitle]}>Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Image Section */}
                <View style={styles.imageSection}>
                    <View style={styles.imageWrapper}>
                        {isUploadingImage ? (
                            <View style={[styles.profileImage, styles.imagePlaceholder, isDarkMode && styles.darkPlaceholder]}>
                                <ActivityIndicator size="large" color="#68BA7F" />
                            </View>
                        ) : profileImage ? (
                            <Image source={profileImage} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.profileImage, styles.imagePlaceholder, isDarkMode && styles.darkPlaceholder]}>
                                <Text style={styles.placeholderText}>👤</Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={[styles.editButton, isDarkMode && styles.darkEditButton]}
                            onPress={handleSelectImage}
                            disabled={isUploadingImage}
                        >
                            <Text style={styles.editButtonText}>✎</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* User Info Section */}
                <View style={[styles.infoSection, isDarkMode && styles.darkInfoSection]}>
                    <View style={[styles.infoItem, isDarkMode && styles.darkInfoItem]}>
                        <View style={styles.labelRow}>
                            <Text style={[styles.infoLabel, isDarkMode && styles.darkInfoLabel]}>Full Name</Text>
                            {!isEditingName ? (
                                <TouchableOpacity onPress={() => setIsEditingName(true)}>
                                    <Text style={styles.editActionText}>Edit</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.editActions}>
                                    <TouchableOpacity onPress={handleSaveName} style={styles.saveAction} disabled={isSavingName}>
                                        {isSavingName ? (
                                            <ActivityIndicator size="small" color="#68BA7F" />
                                        ) : (
                                            <Text style={styles.saveActionText}>Save</Text>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleCancelName}>
                                        <Text style={styles.cancelActionText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        {isEditingName ? (
                            <TextInput
                                style={[styles.nameInput, isDarkMode && styles.darkNameInput]}
                                value={tempName}
                                onChangeText={setTempName}
                                autoFocus
                            />
                        ) : (
                            <Text style={[styles.infoValue, isDarkMode && styles.darkInfoValue]}>{loading ? 'Loading...' : fullName}</Text>
                        )}
                    </View>
                    <View style={[styles.infoItem, isDarkMode && styles.darkInfoItem]}>
                        <Text style={[styles.infoLabel, isDarkMode && styles.darkInfoLabel]}>Email Address</Text>
                        <Text style={[styles.infoValue, isDarkMode && styles.darkInfoValue]}>{loading ? 'Loading...' : email}</Text>
                    </View>

                    {/* Dark Mode Toggle */}
                    <View style={[styles.infoItem, isDarkMode && styles.darkInfoItem, styles.themeItem]}>
                        <View>
                            <Text style={[styles.infoLabel, isDarkMode && styles.darkInfoLabel]}>Appearance</Text>
                            <Text style={[styles.infoValue, isDarkMode && styles.darkInfoValue]}>
                                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                            </Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: "#767577", true: "#68BA7F" }}
                            thumbColor={isDarkMode ? "#FFF" : "#f4f3f4"}
                        />
                    </View>

                    {/* Password Reset Trigger */}
                    <TouchableOpacity
                        style={[styles.infoItem, isDarkMode && styles.darkInfoItem, { borderBottomWidth: 0 }]}
                        onPress={() => setIsPasswordModalVisible(true)}
                    >
                        <Text style={[styles.infoLabel, isDarkMode && styles.darkInfoLabel]}>Security</Text>
                        <Text style={styles.resetPasswordText}>Reset Password</Text>
                    </TouchableOpacity>
                </View>

                {/* Password Reset Modal */}
                <Modal
                    visible={isPasswordModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setIsPasswordModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalOverlay}
                    >
                        <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
                            <Text style={[styles.modalTitle, isDarkMode && styles.darkTitle]}>Reset Password</Text>

                            <TextInput
                                style={[styles.modalInput, isDarkMode && styles.darkModalInput]}
                                placeholder="Current Password"
                                placeholderTextColor={isDarkMode ? "#666" : "#999"}
                                secureTextEntry
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                            />
                            <TextInput
                                style={[styles.modalInput, isDarkMode && styles.darkModalInput]}
                                placeholder="New Password"
                                placeholderTextColor={isDarkMode ? "#666" : "#999"}
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TextInput
                                style={[styles.modalInput, isDarkMode && styles.darkModalInput]}
                                placeholder="Confirm New Password"
                                placeholderTextColor={isDarkMode ? "#666" : "#999"}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setIsPasswordModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleResetPassword}
                                    disabled={isResetting}
                                >
                                    {isResetting ? (
                                        <ActivityIndicator color="#FFF" size="small" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Confirm</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* Logout Section */}
                <TouchableOpacity style={[styles.logoutButton, isDarkMode && styles.darkLogoutButton]} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
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
        backgroundColor: '#000000', // Shiny Shiny Black
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    darkHeader: {
        borderBottomColor: '#1A1A1A',
        backgroundColor: '#000000',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    darkTitle: {
        color: '#FFFFFF',
    },
    backButton: {
        padding: 5,
    },
    backButtonText: {
        fontSize: 16,
        color: '#68BA7F',
    },
    darkBackText: {
        color: '#68BA7F',
    },
    content: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
    },
    imageSection: {
        marginBottom: 30,
    },
    imageWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#E1E8EE',
    },
    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    darkPlaceholder: {
        backgroundColor: '#1A1A1A',
    },
    placeholderText: {
        fontSize: 60,
    },
    editButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#253D2C',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    darkEditButton: {
        borderColor: '#000000',
        backgroundColor: '#68BA7F',
    },
    editButtonText: {
        color: '#FFF',
        fontSize: 18,
    },
    infoSection: {
        width: '90%',
        backgroundColor: '#FFF',
        borderRadius: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    darkInfoSection: {
        backgroundColor: '#0A0A0A', // Glassmorphism-ish shiny black
        borderWidth: 1,
        borderColor: '#1F1F1F',
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    infoItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    darkInfoItem: {
        borderBottomColor: '#1A1A1A',
    },
    themeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 0,
    },
    infoLabel: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    darkInfoLabel: {
        color: '#666',
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    darkInfoValue: {
        color: '#E0E0E0',
    },
    logoutButton: {
        backgroundColor: '#253D2C',
        width: '90%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    darkLogoutButton: {
        backgroundColor: '#1E3123', // Darker shade of primary
    },
    logoutButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    editActionText: {
        fontSize: 12,
        color: '#68BA7F',
        fontWeight: 'bold',
    },
    editActions: {
        flexDirection: 'row',
    },
    saveAction: {
        marginRight: 10,
    },
    saveActionText: {
        fontSize: 12,
        color: '#68BA7F',
        fontWeight: 'bold',
    },
    cancelActionText: {
        fontSize: 12,
        color: '#FF5252',
        fontWeight: 'bold',
    },
    nameInput: {
        fontSize: 16,
        color: '#333',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#68BA7F',
    },
    darkNameInput: {
        color: '#FFFFFF',
    },
    resetPasswordText: {
        fontSize: 16,
        color: '#68BA7F',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 25,
        elevation: 5,
    },
    darkModalContent: {
        backgroundColor: '#0A0A0A',
        borderWidth: 1,
        borderColor: '#1F1F1F',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    modalInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        fontSize: 14,
        color: '#333',
    },
    darkModalInput: {
        backgroundColor: '#1A1A1A',
        color: '#FFF',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        marginRight: 10,
        backgroundColor: '#F5F5F5',
    },
    saveButton: {
        backgroundColor: '#253D2C',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: 'bold',
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default Profile;
