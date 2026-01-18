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
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
    const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
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
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout", onPress: async () => {
                    await AsyncStorage.clear();
                    navigation.replace('Login');
                }
            }
        ]);
    };

    const handleSelectImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });
        if (result.didCancel) return;
        if (result.errorCode) {
            Alert.alert('Error', result.errorMessage || 'Failed to pick image');
            return;
        }
        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            setIsUploadingImage(true);
            try {
                const formData = new FormData();
                formData.append('avatar', {
                    uri: asset.uri,
                    type: asset.type || 'image/jpeg',
                    name: asset.fileName || 'profile.jpg',
                } as any);
                const response = await uploadProfileImage(formData);
                setProfileImage({ uri: response.profileImage });
                Alert.alert('Success', 'Profile image updated');
            } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to upload image');
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
            const stored = await AsyncStorage.getItem('user_data');
            if (stored) {
                const userData = JSON.parse(stored);
                userData.fullName = tempName;
                await AsyncStorage.setItem('user_data', JSON.stringify(userData));
            }
            Alert.alert('Success', 'Name updated');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update name');
            setTempName(fullName);
        } finally {
            setIsSavingName(false);
        }
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
            Alert.alert('Success', 'Password has been updated');
            setIsPasswordModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update password');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#0F172A' : '#F8FAFC'} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.headerBtn, isDarkMode && styles.darkHeaderBtn]}>
                    <MaterialIcons name="arrow-back" size={22} color={isDarkMode ? "#F8FAFC" : "#1E293B"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Profile Settings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Profile Image Section */}
                <View style={styles.imageSection}>
                    <View style={styles.imageWrapper}>
                        {isUploadingImage ? (
                            <View style={[styles.profileImage, styles.placeholderBox, isDarkMode && styles.darkCard]}>
                                <ActivityIndicator size="large" color="#2E8B57" />
                            </View>
                        ) : (
                            <Image
                                source={profileImage ? profileImage : require('../assets/pic.jpg')}
                                style={styles.profileImage}
                            />
                        )}
                        <TouchableOpacity style={styles.editImageBtn} onPress={handleSelectImage}>
                            <MaterialIcons name="camera-alt" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.userNameText, isDarkMode && styles.darkText]}>{fullName || 'User'}</Text>
                    <Text style={styles.userEmailText}>{email || '...'}</Text>
                </View>

                {/* Account Section */}
                <View style={[styles.sectionCard, isDarkMode && styles.darkCard]}>
                    <Text style={[styles.sectionLabel, isDarkMode && styles.darkLabel]}>Account Details</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.infoIconBox}>
                            <MaterialIcons name="person" size={20} color="#2E8B57" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoTitle}>Full Name</Text>
                            {isEditingName ? (
                                <View style={styles.editingRow}>
                                    <TextInput
                                        style={[styles.nameInput, isDarkMode && styles.darkText]}
                                        value={tempName}
                                        onChangeText={setTempName}
                                        autoFocus
                                    />
                                    <TouchableOpacity onPress={handleSaveName} style={styles.saveBtn}>
                                        <MaterialIcons name="check" size={20} color="#2E8B57" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setIsEditingName(false)}>
                                        <MaterialIcons name="close" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>{fullName}</Text>
                            )}
                        </View>
                        {!isEditingName && (
                            <TouchableOpacity onPress={() => setIsEditingName(true)}>
                                <MaterialIcons name="edit" size={18} color="#94A3B8" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.infoIconBox}>
                            <MaterialIcons name="email" size={20} color="#2E8B57" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoTitle}>Email</Text>
                            <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>{email}</Text>
                        </View>
                    </View>
                </View>

                {/* Preference Section */}
                <View style={[styles.sectionCard, isDarkMode && styles.darkCard]}>
                    <Text style={[styles.sectionLabel, isDarkMode && styles.darkLabel]}>Preferences</Text>

                    <View style={styles.infoRow}>
                        <View style={[styles.infoIconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                            <MaterialIcons name={isDarkMode ? "dark-mode" : "light-mode"} size={20} color={isDarkMode ? "#FBBF24" : "#64748B"} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoTitle}>Dark Mode</Text>
                            <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                                {isDarkMode ? 'Currently On' : 'Currently Off'}
                            </Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: "#E2E8F0", true: "#2E8B57" }}
                            thumbColor="#FFF"
                        />
                    </View>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.infoRow} onPress={() => setIsPasswordModalVisible(true)}>
                        <View style={styles.infoIconBox}>
                            <MaterialIcons name="lock" size={20} color="#2E8B57" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoTitle}>Password</Text>
                            <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>Change your password</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <MaterialIcons name="logout" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutBtnText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>WTH Services v1.0.0</Text>

            </ScrollView>

            {/* Password Modal */}
            <Modal visible={isPasswordModalVisible} transparent animationType="fade" onRequestClose={() => setIsPasswordModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContentWrapper}>
                        <View style={[styles.modalCard, isDarkMode && styles.darkCard]}>
                            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Change Password</Text>

                            <View style={[styles.modalInputBox, isDarkMode && styles.darkInputBox]}>
                                <TextInput
                                    style={[styles.modalInput, isDarkMode && styles.darkText]}
                                    placeholder="Current Password"
                                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                                    secureTextEntry={!isCurrentPasswordVisible}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                />
                                <TouchableOpacity onPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}>
                                    <MaterialIcons name={isCurrentPasswordVisible ? "visibility" : "visibility-off"} size={20} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.modalInputBox, isDarkMode && styles.darkInputBox]}>
                                <TextInput
                                    style={[styles.modalInput, isDarkMode && styles.darkText]}
                                    placeholder="New Password"
                                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                                    secureTextEntry={!isNewPasswordVisible}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                                <TouchableOpacity onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}>
                                    <MaterialIcons name={isNewPasswordVisible ? "visibility" : "visibility-off"} size={20} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.modalInputBox, isDarkMode && styles.darkInputBox]}>
                                <TextInput
                                    style={[styles.modalInput, isDarkMode && styles.darkText]}
                                    placeholder="Confirm New Password"
                                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                                    secureTextEntry={!isConfirmPasswordVisible}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                                    <MaterialIcons name={isConfirmPasswordVisible ? "visibility" : "visibility-off"} size={20} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalActionRow}>
                                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsPasswordModalVisible(false)}>
                                    <Text style={styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleResetPassword} disabled={isResetting}>
                                    {isResetting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalConfirmText}>Update</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    darkContainer: { backgroundColor: '#0F172A' },
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
    scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
    imageSection: { alignItems: 'center', marginBottom: 32 },
    imageWrapper: { position: 'relative', marginBottom: 16 },
    profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#FFF' },
    placeholderBox: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
    editImageBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#2E8B57',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#F8FAFC',
    },
    userNameText: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
    userEmailText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
    sectionCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
    },
    darkCard: { backgroundColor: '#1E293B' },
    sectionLabel: { fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 },
    darkLabel: { color: '#64748B' },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    infoIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoTitle: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 2 },
    infoValue: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
    editingRow: { flexDirection: 'row', alignItems: 'center' },
    nameInput: { flex: 1, fontSize: 16, fontWeight: '700', padding: 0, color: '#1E293B' },
    saveBtn: { marginRight: 12 },
    logoutBtn: {
        backgroundColor: '#EF4444',
        flexDirection: 'row',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    logoutBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    versionText: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 32 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', padding: 20 },
    modalContentWrapper: { width: '100%' },
    modalCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 20, textAlign: 'center' },
    modalInputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    darkInputBox: { backgroundColor: '#0F172A', borderColor: '#334155' },
    modalInput: { flex: 1, fontSize: 15, color: '#1E293B' },
    modalActionRow: { flexDirection: 'row', marginTop: 20 },
    modalCancelBtn: { flex: 1, height: 52, justifyContent: 'center', alignItems: 'center' },
    modalCancelText: { color: '#64748B', fontWeight: '700' },
    modalConfirmBtn: {
        flex: 2,
        height: 52,
        backgroundColor: '#2E8B57',
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2E8B57',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    modalConfirmText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});

export default Profile;
