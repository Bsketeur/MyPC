// PrivacyScreen.js

import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ImageBackground,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MAX_WIDTH = 800;
const Container = Platform.OS === 'web' ? View : SafeAreaView;

export default function PrivacyScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.wrapper}>
      <ImageBackground
        source={require('../../assets/fond.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <Container style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { top: insets.top + (Platform.OS === 'ios' ? 10 : 20) },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#C6B17A" />
          </TouchableOpacity>

          <ScrollView
            style={[styles.scrollView, Platform.OS === 'web' && styles.scrollViewWeb]}
            contentContainerStyle={[
              styles.contentContainer,
              {
                paddingTop: insets.top + 60,
                paddingBottom: insets.bottom + 20,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Politique de Confidentialité</Text>
            <Text style={styles.subtitle}>Dernière mise à jour : 6 juillet 2025</Text>

            <Section number="1" title="Données collectées">
              L’Application peut collecter les données suivantes :
              {"\n"}• Identité : pseudonyme ou nom d’utilisateur
              {"\n"}• Adresse e-mail
              {"\n"}• Adresse postale : pour l’envoi/échange de cartes
              {"\n"}• Adresse PayPal : pour les transactions financières
              {"\n"}• Contenu utilisateur : messages envoyés via le chat, cartes ajoutées à la collection, images, commentaires
              {"\n"}• Données techniques : type d’appareil, système d’exploitation, adresse IP (anonymisée)
            </Section>

            <Section number="2" title="Finalités de la collecte">
              Ces données sont collectées pour les raisons suivantes :
              {"\n"}• Gestion des comptes utilisateurs
              {"\n"}• Bon fonctionnement des échanges et ventes de cartes
              {"\n"}• Paiements via PayPal
              {"\n"}• Assistance et support utilisateur
              {"\n"}• Sécurité et prévention des fraudes
              {"\n"}• Statistiques internes d’utilisation (anonymisées)
            </Section>

            <Section number="3" title="Partage des données">
              Les données personnelles ne sont jamais revendues.
              {"\n\n"}Elles peuvent être partagées uniquement dans les cas suivants :
              {"\n"}• Avec PayPal, pour l’exécution des paiements
              {"\n"}• Avec les autorités compétentes, en cas d’obligation légale
              {"\n"}• Avec des prestataires techniques (hébergeur, support), uniquement dans la limite nécessaire à leurs missions et sous engagement de confidentialité
            </Section>

            <Section number="4" title="Durée de conservation">
              • Données de compte : conservées tant que le compte est actif.
              {"\n"}• Données liées aux transactions : conservées 5 ans pour raisons légales et fiscales.
              {"\n"}• Messages et contenu utilisateur : conservés tant que l’utilisateur ne supprime pas son compte.
            </Section>

            <Section number="5" title="Sécurité">
              Nous mettons en place des mesures techniques et organisationnelles pour protéger vos données :
              {"\n"}• Accès restreint aux bases de données
              {"\n"}• Connexions sécurisées (HTTPS)
              {"\n"}• Hébergement sur serveur sécurisé
            </Section>

            <Section number="6" title="Droits des utilisateurs">
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
              {"\n"}• Droit d’accès : obtenir une copie de vos données
              {"\n"}• Droit de rectification : corriger des données inexactes
              {"\n"}• Droit à l’effacement : demander la suppression de votre compte et de vos données
              {"\n"}• Droit d’opposition : vous opposer à certains traitements (ex. statistiques)
              {"\n"}• Droit à la portabilité : recevoir vos données dans un format exploitable
              {"\n\n"}Vous pouvez exercer ces droits en nous contactant à : [adresse email de contact]
            </Section>

            <Section number="7" title="Cookies et traceurs">
              L’application mobile n’utilise pas de cookies à ce jour, mais des outils techniques peuvent être utilisés pour améliorer l’expérience utilisateur (statistiques, sécurité). Aucun tracking à des fins publicitaires n’est mis en place.
            </Section>

            <Section number="8" title="Modifications">
              Nous pouvons modifier cette politique à tout moment. Les utilisateurs seront informés de toute modification importante.
            </Section>

            <Section number="9" title="Contact">
              Pour toute question ou demande concernant vos données personnelles, vous pouvez nous contacter à :
              {"\n"}[ton adresse email ou formulaire de contact]
            </Section>
          </ScrollView>
        </Container>
      </ImageBackground>
    </View>
  );
}

const Section = ({ number, title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>
      {number}. {title}
    </Text>
    <Text style={styles.text}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrapper: Platform.OS === 'web'
    ? { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }
    : { flex: 1 },

  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  backButton: {
    position: 'absolute',
    left: 10,
    zIndex: 10,
    padding: 10,
  },

  scrollView: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 12,
  },

  // Masquer la barre de scroll sur le web
  scrollViewWeb: {
    scrollbarWidth: 'none',      // Firefox
    msOverflowStyle: 'none',     // IE 10+
    '::-webkit-scrollbar': {     // Chrome, Safari et Edge Chromium
      display: 'none',
    },
  },

  contentContainer: {
    flexGrow: 1,
  },

  title: {
    color: '#C6B17A',
    fontWeight: 'bold',
    fontSize: 28,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1.2,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  subtitle: {
    color: '#bbb',
    fontSize: 15,
    marginBottom: 22,
    textAlign: 'center',
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    color: '#C6B17A',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 7,
    textAlign: 'left',
  },

  text: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
});
