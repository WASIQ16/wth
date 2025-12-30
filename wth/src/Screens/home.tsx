import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  startListening,
  stopListening,
  destroy,
  addEventListener,
  removeAllListeners,
  setRecognitionLanguage,
} from '@ascendtis/react-native-voice-to-text';
import { useAppNavigation } from '../navigation/NavigationContext';
import { useTheme } from '../theme/ThemeContext';
import { getProfile } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {};

// Mock Data for Categories with Emojis as icons
const CATEGORIES = [
  { id: 1, name: 'Plumbing', icon: '🔧' },
  { id: 2, name: 'Electrician', icon: '⚡' },
  { id: 3, name: 'Painting', icon: '🎨' },
  { id: 4, name: 'AC Service', icon: '❄️' },
  { id: 5, name: 'Others', icon: '⋯' },
];

const Home: React.FC<Props> = () => {
  const { navigate, replace } = useAppNavigation();
  const { isDarkMode } = useTheme();
  const [problemText, setProblemText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [userData, setUserData] = useState<{ fullName: string; email: string } | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // First try to get from storage for immediate display
      const stored = await AsyncStorage.getItem('user_data');
      if (stored) {
        setUserData(JSON.parse(stored));
      }

      // Then fetch fresh data from API
      const data = await getProfile();
      setUserData(data);
      // Update storage with fresh data
      await AsyncStorage.setItem('user_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching user data in Home:', error);
    }
  };

  useEffect(() => {
    // Setting up Voice listeners
    const startSubscription = addEventListener('onSpeechStart', onSpeechStart);
    const endSubscription = addEventListener('onSpeechEnd', onSpeechEnd);
    const errorSubscription = addEventListener('onSpeechError', onSpeechError);
    const resultsSubscription = addEventListener('onSpeechResults', onSpeechResults);
    const partialResultsSubscription = addEventListener('onSpeechPartialResults', onSpeechPartialResults);

    return () => {
      // Removing listeners when component unmounts
      destroy().then(() => {
        startSubscription.remove();
        endSubscription.remove();
        errorSubscription.remove();
        resultsSubscription.remove();
        partialResultsSubscription.remove();
      });
    };
  }, []);

  const onSpeechStart = (e: any) => {
    console.log('onSpeechStart: ', e);
    setIsListening(true);
  };

  const onSpeechEnd = (e: any) => {
    console.log('onSpeechEnd: ', e);
    setIsListening(false);
  };

  const onSpeechError = (e: any) => {
    console.log('onSpeechError: ', e);
    setIsListening(false);
    // Hide common non-critical errors or customize messages
    if (e.message !== 'No speech match found' && e.message !== 'Speech timeout') {
      Alert.alert('Speech Recognition Error', e.message || 'Something went wrong');
    }
  };

  const onSpeechResults = (e: any) => {
    console.log('onSpeechResults: ', e);
    if (e.value) {
      setProblemText(e.value);
    }
  };

  const onSpeechPartialResults = (e: any) => {
    console.log('onSpeechPartialResults: ', e);
    if (e.value) {
      setProblemText(e.value);
    }
  };

  const toggleListening = async () => {
    try {
      if (isListening) {
        await stopListening();
        setIsListening(false);
      } else {
        setProblemText(''); // Clear existing text when starting new recording
        await setRecognitionLanguage('en-US');
        await startListening();
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not start voice recognition');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleLogout = async () => {
    setIsSidebarVisible(false);
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            await AsyncStorage.clear();
            replace('Login');
          }
        }
      ]
    );
  };

  const menuItems = [
    { id: 'history', name: 'History', icon: '📜' },
    { id: 'rate', name: 'Rate Us', icon: '⭐' },
    { id: 'share', name: 'Share App', icon: '📤' },
    { id: 'logout', name: 'Logout', icon: '🚪', action: handleLogout },
  ];

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
            <Text style={[styles.menuIcon, isDarkMode && styles.darkText]}>☰</Text>
          </TouchableOpacity>
          {/* Avatar - navigates to Profile */}
          <TouchableOpacity onPress={() => navigate('Profile')}>
            <View style={styles.avatarPlaceholder} >
              <Image source={require('../assets/pic.jpg')} style={{ width: 45, height: 45, borderRadius: 22.5 }} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.headerInfo}>
          <Text style={[styles.greetingText, isDarkMode && styles.darkSubText]}>Hello,</Text>
          <Text style={[styles.userName, isDarkMode && styles.darkText]}>
            {userData?.fullName || 'User'}
          </Text>
        </View>

        {/* Primary Input Section */}
        <View style={styles.inputSection}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>What's the problem?</Text>
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

          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => Alert.alert('Model Training', 'Ask Ahmad to Train Model')}
          >
            <Text style={styles.submitButtonText}>Analyze Issue</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Access Categories */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Quick Services</Text>
          <View style={styles.grid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, isDarkMode && styles.darkCategoryCard]}
                onPress={() => navigate('Services', { serviceName: cat.name })}
              >
                <View style={[styles.iconContainer, isDarkMode && styles.darkIconContainer]}>
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                </View>
                <Text style={[styles.categoryName, isDarkMode && styles.darkText]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Sidebar Modal */}
      <Modal
        visible={isSidebarVisible}
        transparent
        animationType="none"
        onRequestClose={toggleSidebar}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleSidebar}
        >
          <Animated.View style={[
            styles.sidebarContainer,
            isDarkMode && styles.darkSidebarContainer
          ]}>
            <View style={styles.sidebarHeader}>
              <View style={styles.sidebarProfileWrapper}>
                <Image source={require('../assets/pic.jpg')} style={styles.sidebarProfileImage} />
              </View>
              <Text style={[styles.sidebarName, isDarkMode && styles.darkText]}>
                {userData?.fullName || 'User'}
              </Text>
              <Text style={styles.sidebarEmail}>{userData?.email || '...'}</Text>
            </View>

            <View style={styles.sidebarDivider} />

            <View style={styles.sidebarMenu}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.sidebarMenuItem}
                  onPress={() => item.action ? item.action() : (toggleSidebar(), Alert.alert(item.name, `Opening ${item.name}...`))}
                >
                  <Text style={styles.sidebarMenuIcon}>{item.icon}</Text>
                  <Text style={[
                    styles.sidebarMenuText,
                    isDarkMode && styles.darkText,
                    item.id === 'logout' && styles.logoutMenuText
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sidebarFooter}>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop: 10,
  },
  menuButton: {
    padding: 10,
    marginLeft: -10,
    marginRight: 10,
  },
  menuIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 6,
  },
  greetingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSubText: {
    color: '#888',
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#333', // Placeholder color
  },
  inputSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#2C3E50',
    marginLeft: 6,
  },
  darkSectionTitle: {
    color: '#E0E0E0',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 10,
    height: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
    minHeight: 120,
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
    backgroundColor: '#68BA7F22', // Light secondary tint
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
  submitButton: {
    backgroundColor: '#253D2C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#253D2C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  categoriesSection: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  darkCategoryCard: {
    backgroundColor: '#0A0A0A',
    borderColor: '#1F1F1F',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#68BA7F22', // Light secondary tint
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  darkIconContainer: {
    backgroundColor: '#1A1A1A',
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebarContainer: {
    width: '75%',
    height: '100%',
    backgroundColor: '#FFF',
    padding: 25,
    paddingTop: 60,
  },
  darkSidebarContainer: {
    backgroundColor: '#0A0A0A',
    borderRightWidth: 1,
    borderRightColor: '#1F1F1F',
  },
  sidebarHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sidebarProfileWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#68BA7F',
    padding: 3,
    marginBottom: 15,
  },
  sidebarProfileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  sidebarName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sidebarEmail: {
    fontSize: 12,
    color: '#888',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#EEE',
    marginBottom: 30,
  },
  sidebarMenu: {
    flex: 1,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 5,
  },
  sidebarMenuIcon: {
    fontSize: 22,
    marginRight: 15,
    width: 30,
    textAlign: 'center',
  },
  sidebarMenuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  logoutMenuText: {
    color: '#FF5252',
  },
  sidebarFooter: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  versionText: {
    fontSize: 12,
    color: '#BBB',
    textAlign: 'center',
  },
});

export default Home;

