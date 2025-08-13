import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ImageBackground,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';

const API_UNREAD = 'https://api-xwqa.onrender.com/api/conversations/unread/';
const ADMIN_ID = 1;

const AccountScreen = (props) => {
  const userId = props.userId || props.route?.params?.userId;
  const navigation = useNavigation();
  const [totalUnread, setTotalUnread] = useState(0);
  const insets = useSafeAreaInsets();

  // Pour le modal custom (optionnel)
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertButtons, setCustomAlertButtons] = useState([]);

  const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertButtons(buttons);
    setShowCustomAlert(true);
  };

  // Rafraîchit le badge à chaque retour sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      if (!userId) return;
      const fetchUnread = async () => {
        try {
          const response = await fetch(`${API_UNREAD}${userId}`);
          const data = await response.json();
          setTotalUnread(data.totalUnread || 0);
        } catch (error) {
          // Optionnel : gestion d'erreur
        }
      };
      fetchUnread();
    }, [userId])
  );

  const accountOptions = [
    { title: "Mon Profil", screen: "ProfileScreen", icon: "person-outline" },
    { title: "Mes alertes", screen: "SavedCardsScreen", icon: "notifications-outline" }, // <-- AJOUT ICI
    { title: "Mes Cartes FT/FS", screen: "UserMarketplaceScreen", icon: "cart-outline" },
    { title: "Messages", screen: "ConversationsListScreen", icon: "chatbubbles-outline" },
  ];

  if (userId && userId === ADMIN_ID) {
    accountOptions.push({ title: "Admin", screen: "AdminScreen", icon: "cog-outline" });
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Tu peux ici ajouter un navigation.reset si tu veux ramener l'utilisateur à la page login
    } catch (error) {
      Alert.alert('Erreur', "Impossible de se déconnecter.");
    }
  };

  // BOUTON NOUS CONTACTER
  const handleContactAdmin = async () => {
    if (!userId) {
      showAlert("Erreur", "Vous devez être connecté pour contacter l'administrateur.");
      return;
    }
    if (userId === ADMIN_ID) {
      showAlert("Info", "Vous êtes déjà l'administrateur.");
      return;
    }
    try {
      const conversationId = userId < ADMIN_ID
        ? `${userId}_${ADMIN_ID}`
        : `${ADMIN_ID}_${userId}`;

      await fetch('https://api-xwqa.onrender.com/api/conversations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          user_ids: [userId, ADMIN_ID]
        }),
      });

      navigation.navigate('MessageScreen', {
        conversationId,
        currentUserId: userId,
        otherUserId: ADMIN_ID,
        otherUserPseudo: "Admin"
      });
    } catch (error) {
      showAlert("Erreur", "Impossible de contacter l'administrateur.");
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/fond.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Mon Compte</Text>
          <View style={styles.midContainer}>
            {accountOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.button}
                onPress={() => navigation.navigate(option.screen, { userId })}
                activeOpacity={0.85}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.leftContent}>
                    <Ionicons
                      name={option.icon}
                      size={22}
                      color="#C6B17A"
                      style={styles.iconStyle}
                    />
                    <Text style={styles.buttonText}>{option.title}</Text>
                  </View>
                  {option.title === "Messages" && totalUnread > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{totalUnread}</Text>
                    </View>
                  )}
                  <Ionicons
                    name="chevron-forward-outline"
                    size={20}
                    color="#C6B17A"
                    style={styles.chevronIcon}
                  />
                </View>
              </TouchableOpacity>
            ))}
            {/* BOUTON NOUS CONTACTER */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleContactAdmin}
              activeOpacity={0.85}
            >
              <View style={styles.buttonContent}>
                <View style={styles.leftContent}>
                  <Ionicons
                    name="mail-outline"
                    size={22}
                    color="#C6B17A"
                    style={styles.iconStyle}
                  />
                  <Text style={styles.buttonText}>Nous contacter</Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color="#C6B17A"
                  style={styles.chevronIcon}
                />
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.logoutButton, { marginBottom: insets.bottom || 18 }]}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
        {/* Si tu utilises un modal custom, décommente ci-dessous */}
        {/* <CustomAlertModal
          isVisible={showCustomAlert}
          title={customAlertTitle}
          message={customAlertMessage}
          buttons={customAlertButtons}
        /> */}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    width: '100%',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingBottom: 0,
    paddingHorizontal: '3%',
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  midContainer: {
    width: '100%',
    marginBottom: 30,
  },
  button: {
    width: '100%',
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#23201A',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    width: '100%',
    position: 'relative',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconStyle: {
    marginRight: 10,
  },
  buttonText: {
    color: '#C6B17A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chevronIcon: {},
  badge: {
    backgroundColor: "red",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    position: "absolute",
    top: -6,
    left: 110,
    zIndex: 2,
  },
  badgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#C6B17A",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    width: "30%",
  },
  logoutButtonText: {
    color: "#181818",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AccountScreen;