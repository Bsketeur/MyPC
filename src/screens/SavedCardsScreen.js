import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import CustomAlertModal from '../components/CustomAlertModal';

const API_URL = 'https://api-xwqa.onrender.com/api/cards/saved-cards/';
const { width } = Dimensions.get('window');
const MAX_WIDTH = 800;

const SavedCardsScreen = ({ route }) => {
  const userId = route.params?.userId;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [savedCards, setSavedCards] = useState([]);
  const insets = useSafeAreaInsets();

  // CustomAlertModal state
  const [isCustomAlertVisible, setIsCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertButtons, setCustomAlertButtons] = useState([]);

  const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => hideAlert() }]) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertButtons(buttons);
    setIsCustomAlertVisible(true);
  };

  const hideAlert = () => {
    setIsCustomAlertVisible(false);
    setCustomAlertTitle('');
    setCustomAlertMessage('');
    setCustomAlertButtons([]);
  };

  const fetchSavedCards = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const fullApiUrl = API_URL + userId;
    try {
      const response = await axios.get(fullApiUrl);

      if (response.data && Array.isArray(response.data.savedCards)) {
        setSavedCards(response.data.savedCards);
      } else if (Array.isArray(response.data)) {
        setSavedCards(response.data);
      } else {
        setSavedCards([]);
      }
    } catch (e) {
      showAlert('Erreur', 'Erreur lors du chargement de vos cartes sauvegardées.');
      setSavedCards([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleDeleteSavedCard = (savedCardId, cardName) => {
    showAlert(
      "Supprimer l'alerte",
      `Voulez-vous vraiment supprimer l'alerte pour la carte "${cardName}" ?`,
      [
        { text: "Annuler", style: "cancel", onPress: () => hideAlert() },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            hideAlert();
            try {
              await axios.delete(`${API_URL}${savedCardId}`);
              showAlert('Succès', `L'alerte pour la carte "${cardName}" a été supprimée.`);
              fetchSavedCards();
            } catch (error) {
              showAlert('Erreur', `Impossible de supprimer l'alerte pour la carte "${cardName}".`);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchSavedCards();
  }, [fetchSavedCards]);

  const renderItem = ({ item }) => (
    <View style={styles.cardRow}>
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => navigation.navigate('CardDetailsSearchScreen', { card: item, userId })}
        activeOpacity={0.85}
      >
        <Image
          source={item.photo ? { uri: item.photo } : require('../../assets/placeholder.png')}
          style={styles.cardImage}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardMeta}>
            {item.year} {item.card_set} #{item.number}
          </Text>
          {item.attributes ? (
            typeof item.attributes === 'object' && Object.keys(item.attributes).length > 0 ? (
              <View style={styles.cardAttributesContainer}>
                {Object.entries(item.attributes).map(([key, value]) => (
                  <Text key={key} style={styles.cardAttributeItem}>
                    <Text style={{ fontWeight: 'bold' }}>{key}</Text><Text>: {String(value)}</Text>
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.cardAttributeItem}>{String(item.attributes)}</Text>
            )
          ) : null}
          {item.type && <Text style={styles.cardType}>Type : {item.type}</Text>}
          {item.price && <Text style={styles.cardPrice}>{item.price} €</Text>}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteSavedCard(item.id, item.name)}
      >
        <Ionicons name="trash-outline" size={24} color="#FF6347" />
      </TouchableOpacity>
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
        {/* En-tête avec la flèche et le titre pour un meilleur contrôle du positionnement */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#C6B17A" />
          </TouchableOpacity>
          <Text style={styles.title}>Mes alertes</Text>
          <View style={styles.emptySpace} />
        </View>
        <View style={styles.contentWrapper}>
          {loading ? (
            <ActivityIndicator size="large" color="#C6B17A" style={{ marginTop: 30 }} />
          ) : savedCards.length === 0 ? (
            <Text style={styles.emptyText}>Aucune carte sauvegardée.</Text>
          ) : (
            <FlatList
              data={savedCards}
              keyExtractor={item => (item.id ? item.id.toString() : Math.random().toString())}
              renderItem={renderItem}
              style={styles.list}
              contentContainerStyle={{ paddingBottom: 35 + (insets.bottom || 0), paddingTop: 5 }}
              showsVerticalScrollIndicator={true}
            />
          )}
        </View>
      </SafeAreaView>

      <CustomAlertModal
        isVisible={isCustomAlertVisible}
        title={customAlertTitle}
        message={customAlertMessage}
        buttons={customAlertButtons}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  emptySpace: {
    width: 28 + 20, // Taille de l'icône + padding pour simuler l'alignement
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  list: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C6B17A',
    backgroundColor: 'rgba(20,20,20,0.95)',
    marginBottom: 14,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  cardImage: {
    width: 70,
    height: 100,
    resizeMode: 'cover',
    marginRight: 15,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#C6B17A',
    backgroundColor: '#23201A',
  },
  cardInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C6B17A',
    marginBottom: 4,
    flexWrap: 'wrap',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
    fontSize: 15,
    color: '#C6B17A',
    fontWeight: 'bold',
    marginTop: 7,
  },
  cardAttributesContainer: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.2)',
    width: '100%',
  },
  cardAttributeItem: {
    fontSize: 13,
    color: '#FFF',
    marginBottom: 2,
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
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
  deleteButton: {
    marginLeft: 0,
    padding: 7,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
});

export default SavedCardsScreen;
