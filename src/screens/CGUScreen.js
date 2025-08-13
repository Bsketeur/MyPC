// CGUScreen.js

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

export default function CGUScreen({ navigation }) {
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
                paddingTop: insets.top + 50,
                paddingBottom: insets.bottom + 20,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Conditions Générales d’Utilisation</Text>
            <Text style={styles.subtitle}>Dernière mise à jour : 6 juillet 2025</Text>

            <Section number="1" title="Objet">
              Les présentes Conditions Générales d’Utilisation (ci-après les « CGU ») ont pour objet de définir les modalités
              d’accès et d’utilisation de l’application MyPC, éditée par [Ton nom ou ta société] (ci-après l’« Éditeur »), permettant
              aux utilisateurs de collectionner, échanger, vendre et acheter des cartes de sport.

              {"\n\n"}L’utilisation de l’application vaut acceptation pleine et entière des présentes CGU.
            </Section>

            <Section number="2" title="Accès au service">
              L’application est accessible aux utilisateurs disposant d’un compte valide. L’inscription nécessite la fourniture des
              informations suivantes :

              {"\n"}• Nom d’utilisateur
              {"\n"}• Adresse email
              {"\n"}• Adresse postale
              {"\n"}• Adresse PayPal (pour les paiements)

              {"\n\n"}L’utilisateur s’engage à fournir des informations exactes et à les mettre à jour.
            </Section>

            <Section number="3" title="Fonctionnalités de l'application">
              • Gestion de collection : créer, organiser et gérer ses collections de cartes.
              {"\n"}• Échange de cartes : système d’échange via un chat intégré.
              {"\n"}• Vente de cartes : vendre ses cartes à d’autres utilisateurs via PayPal.
              {"\n"}• Commission : 10 % sur chaque vente, prélevée par l’Éditeur.
            </Section>

            <Section number="4" title="Paiements">
              Tous les paiements sont réalisés via PayPal.

              {"\n\n"}Les utilisateurs sont seuls responsables de la validité de leur compte PayPal.

              {"\n\n"}Les transactions sont définitives et non remboursables, sauf accord express entre les parties.
            </Section>

            <Section number="5" title="Responsabilités de l’utilisateur">
              L’utilisateur s’engage à :
              {"\n"}• Ne pas utiliser l’application à des fins illégales ou contraires aux bonnes mœurs.
              {"\n"}• Respecter les autres utilisateurs (pas d’insultes, menaces, etc.).
              {"\n"}• Ne pas utiliser l’application pour promouvoir des services tiers.

              {"\n\n"}L’utilisateur est seul responsable des contenus qu’il partage (images de cartes, messages).
            </Section>

            <Section number="6" title="Responsabilité de l’Éditeur">
              L’Éditeur met tout en œuvre pour assurer la disponibilité de l’application, sans garantir une disponibilité permanente.

              {"\n\n"}L’Éditeur ne pourra être tenu responsable :
              {"\n"}• Des interruptions de service (technique, maintenance).
              {"\n"}• Des pertes ou litiges entre utilisateurs.
              {"\n"}• Des contenus publiés par les utilisateurs.
            </Section>

            <Section number="7" title="Propriété intellectuelle">
              Tous les éléments de l’application (design, logo, nom, code…) sont protégés par la propriété intellectuelle.
              Toute reproduction ou exploitation sans autorisation est interdite.
            </Section>

            <Section number="8" title="Données personnelles">
              L’application collecte certaines données personnelles (adresse postale, PayPal…) uniquement pour le fonctionnement du
              service. Ces données ne sont ni revendues ni communiquées à des tiers, sauf obligation légale.

              {"\n\n"}Pour plus de détails, consultez notre Politique de confidentialité.
            </Section>

            <Section number="9" title="Suspension / Suppression de compte">
              L’Éditeur se réserve le droit de suspendre ou supprimer tout compte en cas de non-respect des CGU, sans préavis.
            </Section>

            <Section number="10" title="Modifications">
              Les CGU peuvent être modifiées à tout moment. Les utilisateurs seront notifiés et devront accepter les nouvelles CGU
              pour continuer à utiliser l’application.
            </Section>

            <Section number="11" title="Droit applicable">
              Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux compétents seront ceux du lieu de
              domiciliation de l’Éditeur.
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

  // Cacher la barre de scroll sur le web
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
