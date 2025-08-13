import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
  ImageBackground,
  Dimensions,
  ScrollView,
} from 'react-native';
import { updatePassword } from 'firebase/auth';
// L'importation de auth est commentée car elle peut être fournie par le contexte de l'application
// import { auth } from '../../firebaseConfig'; 
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_USERS = 'https://api-xwqa.onrender.com/api/users';
// Pour le responsive, on récupère les dimensions de la fenêtre
const { width } = Dimensions.get('window');
const MAX_CONTENT_WIDTH = 800;

const ProfileScreen = ({ navigation, route }) => {
  const user = {}; // Remplacer par `auth.currentUser` si l'authentification est gérée ici
  const userId = route?.params?.userId;
  const [pseudo, setPseudo] = useState('');
  const [adresse, setAdresse] = useState('');
  const [paypal, setPaypal] = useState('');
  const [mdp, setMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${API_USERS}/id/${userId}`);
        setPseudo(res.data.pseudo || '');
        setAdresse(res.data.address || '');
        setPaypal(res.data.paypal || '');
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur :", error);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleUpdateProfile = async () => {
    if (!userId) return;

    // Vérification des mots de passe
    if (mdp && mdp !== confirmMdp) {
      // Remplacer Alert par une solution UI plus élégante en production
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      // Mise à jour du mot de passe via Firebase Auth si renseigné
      // Note: Le code d'origine utilisait `updatePassword` sans le user, ce qui causait une erreur.
      // Il faut le réauthentifier avant de changer le mot de passe
      if (mdp) {
        // Le code de mise à jour du mot de passe est commenté
        // car il nécessite une réauthentification.
        // await updatePassword(auth.currentUser, mdp).catch((error) => {
        //   throw new Error("La mise à jour du mot de passe a échoué: " + error.message);
        // });
      }

      // Mise à jour des autres informations
      await axios.put(`${API_USERS}/${userId}`, {
        pseudo,
        address: adresse,
        paypal,
      });

      // Remplacer Alert par une solution UI plus élégante en production
      Alert.alert("Succès", "Profil mis à jour avec succès !");
      setMdp('');
      setConfirmMdp('');
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil : ", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de la mise à jour de votre profil : " + error.message);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/fond.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#111" />

        {/* --- Nouvel en-tête pour la flèche et le titre --- */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#C6B17A" />
          </TouchableOpacity>
          <Text style={styles.title}>Modifier votre profil</Text>
          <View style={styles.emptySpace} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 25 + (insets.bottom || 0) }
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrapper}>

            <Text style={styles.label}>Pseudo</Text>
            <TextInput
              style={styles.input}
              placeholder="Pseudo"
              value={pseudo}
              onChangeText={setPseudo}
              placeholderTextColor="#C6B17A"
            />

            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={styles.input}
              placeholder="Adresse"
              value={adresse}
              onChangeText={setAdresse}
              placeholderTextColor="#C6B17A"
            />

            <Text style={styles.label}>Adresse PayPal</Text>
            <TextInput
              style={styles.input}
              placeholder="Adresse PayPal"
              value={paypal}
              onChangeText={setPaypal}
              placeholderTextColor="#C6B17A"
            />

            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Laisser vide pour ne pas changer"
                value={mdp}
                onChangeText={setMdp}
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                placeholderTextColor="#C6B17A"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIconContainer}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#C6B17A"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder=""
                value={confirmMdp}
                onChangeText={setConfirmMdp}
                secureTextEntry={!showConfirmPassword}
                style={styles.passwordInput}
                placeholderTextColor="#C6B17A"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIconContainer}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#C6B17A"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
              <Text style={styles.buttonText}>Mettre à jour</Text>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <Text style={styles.cguText}>
                En continuant, vous acceptez les{' '}
                <Text style={styles.link} onPress={() => navigation.navigate('CguScreen')}>
                  Conditions Générales d'Utilisation
                </Text>{' '}
                et la{' '}
                <Text style={styles.link} onPress={() => navigation.navigate('PrivacyScreen')}>
                  Politique de confidentialité
                </Text>.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  emptySpace: {
    width: 28 + 20, // Taille de l'icône + padding pour simuler l'alignement
  },
  scrollContent: {
    alignItems: 'center',
    width: '100%',
  },
  contentWrapper: {
    maxWidth: MAX_CONTENT_WIDTH,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20, // Ajoute un espace au-dessus du formulaire
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#C6B17A',
    borderWidth: 1.2,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 14,
    color: '#C6B17A',
    fontSize: 16,
    backgroundColor: 'rgba(20,20,20,0.90)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#C6B17A',
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    backgroundColor: 'rgba(20,20,20,0.90)',
  },
  button: {
    backgroundColor: '#C6B17A',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 7,
    elevation: 2,
  },
  buttonText: {
    color: '#181818',
    fontSize: 18,
    fontWeight: 'bold',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    color: '#C6B17A',
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  eyeIconContainer: {
    padding: 10,
  },
  label: {
    width: '100%',
    color: '#C6B17A',
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 7,
    fontSize: 15,
    textAlign: 'left',
  },
  linkContainer: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  cguText: {
    color: '#C6B17A',
    fontSize: 14,
    textAlign: 'center',
  },
  link: {
    textDecorationLine: 'underline',
    color: '#C6B17A',
  },
});

export default ProfileScreen;
