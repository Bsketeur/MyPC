import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Platform
} from 'react-native';

// Importer l'image de manière compatible avec le web
// L'instruction "import" standard est gérée par Webpack,
// tandis que "require" fonctionne bien pour le mobile.
// On fait une importation conditionnelle pour le web.
const fondImage = require('../../assets/fond.png');


const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => (
  <ImageBackground
    source={fondImage} // Utilise l'image importée directement pour une meilleure compatibilité
    style={styles.background}
    resizeMode="cover"
  >
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur MyPC</Text>
      <Text style={styles.text}>
        Cette application vous permet de découvrir, vendre, échanger et collectionner des cartes.
        {"\n\n"}
        ⚠️ Certaines fonctionnalités comme le panier et le paiement intégré ne sont pas encore actives.
        {"\n\n"}
        Si l'application rencontre du succès, ces fonctionnalités seront ajoutées prochainement !
        {"\n\n"}
        Merci de votre compréhension et bonne découverte !
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('Login')}
      >
        <Text style={styles.buttonText}>Continuer</Text>
      </TouchableOpacity>
    </View>
  </ImageBackground>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C6B17A',
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 1,
  },
  text: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  button: {
    backgroundColor: '#C6B17A',
    paddingVertical: 12,      // réduit la hauteur
    paddingHorizontal: 30,    // réduit la largeur
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    width: width * 0.2,       // bouton plus étroit (20% de la largeur)
  },
  buttonText: {
    color: '#181818',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default WelcomeScreen;
