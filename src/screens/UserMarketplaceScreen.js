import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ImageBackground,
  Platform,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomAlertModal from '../components/CustomAlertModal';

const API_MARKETPLACE_USER = 'https://api-xwqa.onrender.com/api/marketplace/user';
const API_MARKETPLACE_DELETE = 'https://api-xwqa.onrender.com/api/marketplace'; // + /:id

const { width } = Dimensions.get('window');
const MAX_WIDTH = 800;

const UserMarketplaceScreen = ({ navigation, route }) => {
  const userId = route?.params?.userId;
  const [userMarketplaceCards, setUserMarketplaceCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  // Pour CustomAlertModal
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertButtons, setCustomAlertButtons] = useState([]);

  // Fonction utilitaire pour afficher le modal personnalisé
  const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertButtons(buttons);
    setShowCustomAlert(true);
  };

  // Chargement des cartes du marketplace de l'utilisateur connecté
  const fetchUserMarketplaceCards = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_MARKETPLACE_USER}/${userId}`);
      setUserMarketplaceCards(res.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement du marketplace utilisateur:", error);
      showAlert('Erreur', 'Erreur lors du chargement du marketplace utilisateur.');
      setUserMarketplaceCards([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Rafraîchit la liste à chaque focus de la page
  useFocusEffect(
    useCallback(() => {
      fetchUserMarketplaceCards();
    }, [fetchUserMarketplaceCards])
  );

  // Fonction pour retirer la carte du marketplace
  const returnCardToCollection = (card) => {
    showAlert(
      "Retirer du Marketplace",
      "Voulez-vous vraiment retirer cette carte du marketplace ? (Cela signifie qu'elle a été vendue ou échangée)",
      [
        { text: "Annuler", style: "cancel", onPress: () => setShowCustomAlert(false) },
        {
          text: "Confirmer",
          style: "destructive",
          onPress: async () => {
            setShowCustomAlert(false);
            try {
              await axios.delete(`${API_MARKETPLACE_DELETE}/${card.id}`);
              fetchUserMarketplaceCards();
              showAlert('Succès', 'La carte a été retirée du marketplace.');
            } catch (error) {
              console.error("Erreur lors du retrait de la carte du marketplace:", error);
              showAlert('Erreur', 'Une erreur est survenue lors du retrait de la carte du marketplace.');
            }
          }
        }
      ]
    );
  };

  const renderCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <Image
        source={
          item.photo
            ? { uri: item.photo }
            : require('../../assets/placeholder.png')
        }
        style={styles.cardImage}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardMeta}>
          {item.year} {item.card_set} #{item.number}
        </Text>
        {item.type && <Text style={styles.cardType}>{item.type}</Text>}
        {item.prix && <Text style={styles.cardPrice}>{item.prix} €</Text>}
        <TouchableOpacity style={styles.button} onPress={() => returnCardToCollection(item)}>
          <Text style={styles.buttonText}>Retirer du Marketplace</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require('../../assets/fond.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.centeredContainer}>
          {/* Bouton retour */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#C6B17A" />
          </TouchableOpacity>
          <Text style={styles.title}>Mes Cartes sur le Marketplace</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#C6B17A" style={{ marginTop: 30 }} />
          ) : (
            <FlatList
              data={userMarketplaceCards}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={renderCard}
              style={styles.list}
              contentContainerStyle={{ paddingBottom: 35 + (insets.bottom || 0), paddingTop: 5 }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Aucune carte trouvée sur le marketplace.</Text>
              }
              showsVerticalScrollIndicator={true}
            />
          )}
        </View>
        <CustomAlertModal
          isVisible={showCustomAlert}
          title={customAlertTitle}
          message={customAlertMessage}
          buttons={customAlertButtons}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  centeredContainer: {
    flex: 1,
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 60,
    left: 10,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 10,
  },
  list: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: 12,
    borderWidth: 1.3,
    borderColor: '#23201A',
    backgroundColor: 'rgba(20,20,20,0.95)',
    marginBottom: 14,
    marginHorizontal: width > MAX_WIDTH ? 0 : width * 0.03,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  cardImage: {
    width: 60,
    height: 90,
    resizeMode: 'cover',
    marginRight: 15,
    borderRadius: 7,
    borderWidth: 1.2,
    borderColor: '#C6B17A',
    backgroundColor: '#23201A',
  },
  cardInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#C6B17A',
    marginBottom: 3,
    flexWrap: 'wrap',
  },
  cardMeta: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  cardType: {
    fontSize: 14,
    color: '#C6B17A',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  cardPrice: {
    fontSize: 14,
    color: '#C6B17A',
    fontWeight: 'bold',
    marginTop: 7,
  },
  button: {
    backgroundColor: '#C6B17A',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    minWidth: 180,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 7,
    elevation: 2,
  },
  buttonText: {
    color: '#181818',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 18,
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#C6B17A',
    textAlign: 'center',
    marginTop: 30,
  },
});

export default UserMarketplaceScreen;