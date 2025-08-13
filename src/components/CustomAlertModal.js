// src/components/CustomAlertModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

// Le composant accepte maintenant une prop 'buttons' qui est un tableau
const CustomAlertModal = ({ isVisible, title, message, buttons }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      // onRequestClose est géré par les onPress des boutons, ou par un bouton "Annuler" si fourni
      onRequestClose={() => { /* Optionnel: gérer la fermeture par le bouton retour Android si aucun bouton n'est "cancel" */ }}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.header}>
            {/* L'icône peut être conditionnelle ou fixe selon le type d'alerte */}
            <Ionicons name="checkmark-circle-outline" size={40} color="#C6B17A" />
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  // Appliquer un style différent pour le bouton "cancel" si spécifié
                  button.style === 'cancel' ? styles.buttonCancel : styles.buttonPrimary,
                  // Si un seul bouton, il prend toute la largeur
                  buttons.length === 1 && styles.buttonFullWidth,
                  // Si plusieurs boutons, ajuster la largeur pour qu'ils se placent côte à côte
                  buttons.length > 1 && styles.buttonMulti,
                ]}
                onPress={button.onPress}
              >
                <Text style={[
                  styles.buttonText,
                  button.style === 'cancel' ? styles.buttonTextCancel : styles.buttonTextPrimary,
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fond semi-transparent
  },
  alertContainer: {
    width: '85%', // Légèrement plus large pour les boutons multiples
    backgroundColor: '#2A2A2A', // Fond de l'alerte (sombre)
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#C6B17A', // Bordure dorée
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C6B17A', // Texte doré
    marginLeft: 10,
    textAlign: 'center',
    flexShrink: 1, // Permet au titre de se réduire si trop long
  },
  message: {
    fontSize: 16,
    color: '#E0E0E0', // Texte clair
    textAlign: 'center',
    marginBottom: 25,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Permet aux boutons de passer à la ligne
    justifyContent: 'center', // Centre les boutons
    width: '100%',
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5, // Espacement entre les boutons
    marginVertical: 5, // Espacement vertical pour les boutons sur plusieurs lignes
  },
  buttonFullWidth: {
    width: '80%', // Pour un seul bouton, prend 80% de la largeur du container
  },
  buttonMulti: {
    minWidth: '40%', // Pour plusieurs boutons, ils prennent au moins 40%
    flexGrow: 1, // Permet aux boutons de grandir pour remplir l'espace
  },
  buttonPrimary: {
    backgroundColor: '#C6B17A', // Bouton doré
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#C6B17A',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextPrimary: {
    color: '#1A1A1A', // Texte sombre sur le bouton doré
  },
  buttonTextCancel: {
    color: '#C6B17A', // Texte doré sur le bouton transparent
  },
});

export default CustomAlertModal;
