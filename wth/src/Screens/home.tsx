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
import { getProfile } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {};

// Categories with MaterialIcons for a professional look
const CATEGORIES = [
  { id: 1, name: 'Plumbing', icon: 'plumbing' },
  { id: 2, name: 'Electrician', icon: 'electrical-services' },
  { id: 3, name: 'Painting', icon: 'format-paint' },
  { id: 4, name: 'AC Service', icon: 'ac-unit' },
  { id: 5, name: 'Others', icon: 'more-horiz' },
];

const Home: React.FC<Props> = () => {
  const { navigate, replace } = useAppNavigation();
  const { isDarkMode } = useTheme();
  const [problemText, setProblemText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [userData, setUserData] = useState<{ fullName: string; email: string; profileImage?: string } | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_data');
      if (stored) {
        setUserData(JSON.parse(stored));
      }
      const data = await getProfile();
      setUserData(data);
      await AsyncStorage.setItem('user_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching user data in Home:', error);
    }
  };

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
      console.error(e);
      Alert.alert('Error', 'Could not start voice recognition');
    }
  };

  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  const handleLogout = async () => {
    setIsSidebarVisible(false);
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout", onPress: async () => {
          await AsyncStorage.clear();
          replace('Login');
        }
      }
    ]);
  };

  const menuItems = [
    { id: 'history', name: 'History', icon: 'history' },
    { id: 'rate', name: 'Rate Us', icon: 'star-rate' },
    { id: 'share', name: 'Share App', icon: 'share' },
    { id: 'logout', name: 'Logout', icon: 'logout', action: handleLogout },
  ];

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#0F172A' : '#F8FAFC'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar} style={[styles.headerBtn, isDarkMode && styles.darkHeaderBtn]}>
            <MaterialIcons name="menu" size={24} color={isDarkMode ? "#F8FAFC" : "#1E293B"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate('Profile')}>
            <Image
              source={userData?.profileImage ? { uri: userData.profileImage } : require('../assets/pic.jpg')}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.greetingContainer}>
          <Text style={[styles.greetingSub, isDarkMode && styles.darkSubText]}>Good Day,</Text>
          <Text style={[styles.greetingMain, isDarkMode && styles.darkText]}>
            {userData?.fullName?.split(' ')[0] || 'User'} 👋
          </Text>
        </View>

        {/* Input Card */}
        <View style={[styles.inputCard, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>Describe Your Issue</Text>
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
          <TouchableOpacity
            style={styles.analyzeBtn}
            onPress={() => Alert.alert('Processing', 'Analyzing your request...')}
          >
            <Text style={styles.analyzeBtnText}>Analyze Issue</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {/* Services Grid */}
        <View style={styles.servicesHeader}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Quick Services</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, isDarkMode && styles.darkCard]}
              onPress={() => navigate('Services', { serviceName: cat.name })}
            >
              <View style={[styles.iconBox, isDarkMode && styles.darkIconBox]}>
                <MaterialIcons name={cat.icon} size={28} color="#2E8B57" />
              </View>
              <Text style={[styles.categoryName, isDarkMode && styles.darkText]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Sidebar Modal */}
      <Modal visible={isSidebarVisible} transparent animationType="fade" onRequestClose={toggleSidebar}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={toggleSidebar}>
          <Animated.View style={[styles.sidebar, isDarkMode && styles.darkSidebar]}>
            <View style={styles.sidebarHeader}>
              <View style={styles.sidebarProfileBorder}>
                <Image
                  source={userData?.profileImage ? { uri: userData.profileImage } : require('../assets/pic.jpg')}
                  style={styles.sidebarAvatar}
                />
              </View>
              <Text style={[styles.sidebarName, isDarkMode && styles.darkText]}>{userData?.fullName || 'User'}</Text>
              <Text style={styles.sidebarEmail}>{userData?.email || '...'}</Text>
            </View>

            <View style={styles.sidebarMenu}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => item.action ? item.action() : (toggleSidebar(), Alert.alert(item.name, `Opening ${item.name}...`))}
                >
                  <View style={[styles.menuIconBox, isDarkMode && styles.darkMenuIconBox]}>
                    <MaterialIcons
                      name={item.icon}
                      size={20}
                      color={item.id === 'logout' ? "#FF4B4B" : "#2E8B57"}
                    />
                  </View>
                  <Text style={[
                    styles.menuText,
                    isDarkMode && styles.darkText,
                    item.id === 'logout' && { color: '#FF4B4B', fontWeight: '700' }
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sidebarFooter}>
              <Text style={styles.versionLabel}>WTH Services v1.0.0</Text>
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
    backgroundColor: '#F8FAFC',
  },
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  darkHeaderBtn: {
    backgroundColor: '#1E293B',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  greetingContainer: {
    marginBottom: 24,
  },
  greetingSub: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  greetingMain: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
  },
  darkText: {
    color: '#F8FAFC',
  },
  darkSubText: {
    color: '#94A3B8',
  },
  inputCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  darkCard: {
    backgroundColor: '#1E293B',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 12,
    minHeight: 100,
  },
  darkInputWrapper: {
    backgroundColor: '#0F172A',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    textAlignVertical: 'top',
  },
  micBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#2E8B57',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  micBtnActive: {
    backgroundColor: '#EF4444',
  },
  analyzeBtn: {
    backgroundColor: '#2E8B57',
    flexDirection: 'row',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  analyzeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  servicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  viewAllText: {
    color: '#2E8B57',
    fontWeight: '700',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  darkIconBox: {
    backgroundColor: '#0F172A',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sidebar: {
    width: '75%',
    height: '100%',
    backgroundColor: '#FFF',
    padding: 24,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  darkSidebar: {
    backgroundColor: '#0F172A',
  },
  sidebarHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sidebarProfileBorder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#F0FDF4',
    padding: 4,
    marginBottom: 16,
  },
  sidebarAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  sidebarName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  sidebarEmail: {
    fontSize: 14,
    color: '#64748B',
  },
  sidebarMenu: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  darkMenuIconBox: {
    backgroundColor: '#1E293B',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  sidebarFooter: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  versionLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default Home;

