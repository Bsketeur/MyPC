// src/screens/LoginScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Image,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useAuth } from '../AuthProvider';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const authContext = useAuth();

  useEffect(() => {
    console.log("LoginScreen: Valeur de authContext (depuis useAuth()):", authContext);
  }, [authContext]);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Veuillez entrer votre email et votre mot de passe.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      let errorMessage = 'Email ou mot de passe invalide. Veuillez réessayer.';
      if (err.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'Ce compte a été désactivé.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Email ou mot de passe incorrect.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ImageBackground
          source={require('../../assets/fond.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: insets.bottom || 18 }}>
              <View style={styles.innerContainer}>
                <Image source={require('../../assets/logo.png')} style={styles.logo} />
                <Text style={styles.title}>Connexion</Text>
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  style={styles.input}
                  placeholderTextColor="#C6B17A"
                  autoCapitalize="none"
                />
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Mot de passe"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                    placeholderTextColor="#C6B17A"
                  />
                  <TouchableOpacity
                    style={styles.eyeIconContainer}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon name={showPassword ? "eye-slash" : "eye"} size={20} color="#C6B17A" />
                  </TouchableOpacity>
                </View>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                {loading && <ActivityIndicator size="large" color="#C6B17A" style={{ marginBottom: 10 }} />}
                <TouchableOpacity
                  onPress={handleLogin}
                  style={[styles.button, loading && { opacity: 0.5 }]}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Se connecter</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.buttonSecondary}>
                  <Text style={styles.buttonTextSecondary}>Pas encore de compte ? S'inscrire</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 0,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 40,
    maxWidth: 400,
    alignSelf: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 30,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#C6B17A',
    padding: 14,
    marginBottom: 18,
    color: '#fff',
    borderRadius: 10,
    width: '90%',
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C6B17A',
    borderRadius: 10,
    marginBottom: 18,
    width: '90%',
    backgroundColor: 'transparent',
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    color: '#fff',
    fontSize: 16,
  },
  eyeIconContainer: {
    padding: 10,
  },
  error: {
    color: '#FF5555',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#C6B17A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 18,
    width: '90%',
    shadowColor: '#C6B17A',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#111',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderColor: '#C6B17A',
    borderWidth: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '90%',
  },
  buttonTextSecondary: {
    color: '#C6B17A',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
