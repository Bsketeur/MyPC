import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Platform,
  Dimensions,
  ImageBackground,
  TextInput,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';

const API_USER_COLLECTION = 'https://api-xwqa.onrender.com/api/users';

const { width, height } = Dimensions.get('window');

const MAX_CONTENT_WIDTH = 800; // max largeur du contenu centré

const CategoryCardsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { category, userId } = route.params;
  const insets = useSafeAreaInsets();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const allRes = await axios.get(`${API_USER_COLLECTION}/${userId}/collection`);
      const allCollectionCards = allRes.data.collection || [];

      const catCardsRes = await axios.get(`${API_USER_COLLECTION}/${userId}/card-categories`);
      const allLinks = catCardsRes.data || [];

      const cardIdsInCurrentCategory = allLinks
        .filter(link => link.category_id === category.id)
        .map(link => link.card_id);

      setCards(allCollectionCards.filter(card => cardIdsInCurrentCategory.includes(card.id)));
    } catch (error) {
      console.error("Erreur lors du chargement des cartes:", error);
      setCards([]);
      Alert.alert('Erreur', "Impossible de charger les cartes. Veuillez vérifier votre connexion.");
    } finally {
      setLoading(false);
    }
  }, [userId, category.id]);

  useFocusEffect(
    useCallback(() => {
      fetchCards();
    }, [fetchCards])
  );

  const handleRemoveCardFromCategory = async (cardId) => {
    try {
      await axios.delete(`${API_USER_COLLECTION}/${userId}/categories/${category.id}/remove-card/${cardId}`);
      fetchCards();
    } catch (error) {
      console.error("Erreur lors du retrait de la carte:", error);
      Alert.alert('Erreur', "Impossible de retirer la carte. Veuillez réessayer.");
    }
  };

  const handleImportFile = async () => {
    setIsImporting(true);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true,
      });

      if (res.canceled) {
        console.log('Importation annulée.');
        setIsImporting(false);
        return;
      }
      
      const fileContent = await fetch(res.assets[0].uri).then(response => response.text());
      const cardIdentifiers = fileContent.split('\n').map(line => line.trim()).filter(Boolean);

      if (cardIdentifiers.length > 0) {
        const importEndpoint = `${API_USER_COLLECTION}/${userId}/categories/${category.id}/bulk-add-cards`;
        const response = await axios.post(importEndpoint, { cardIdentifiers });
        Alert.alert('Succès', `${response.data.count} cartes ont été ajoutées.`);
      } else {
        Alert.alert('Erreur', "Le fichier est vide ou ne contient aucun identifiant de carte valide.");
      }

      fetchCards();

    } catch (error) {
      console.error("Erreur lors de l'importation du fichier:", error);
      Alert.alert('Erreur', "Impossible d'importer les cartes. Veuillez vérifier le fichier et votre connexion.");
    } finally {
      setIsImporting(false);
    }
  };

  const openCardDetails = (card) => {
    navigation.navigate('CardDetailsScreen', { card, userId });
  };

  const filterCards = (list) => {
    if (!searchQuery.trim()) return list;
    const searchWords = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return list.filter((c) => {
      const cardSearchableText = [
        c.name,
        String(c.year),
        c.card_set,
        String(c.number),
        c.attributes
      ].filter(Boolean)
        .map(text => String(text).toLowerCase())
        .join(' ');

      return searchWords.every(word => cardSearchableText.includes(word));
    });
  };

  const filteredCards = filterCards(cards);

  const renderCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => openCardDetails(item)} activeOpacity={0.85}>
        <View>
          <Text style={styles.cardTitle}>
            <Text style={styles.nameStyle}>{item.name}</Text>
            <Text style={styles.subtext}> | </Text>
            <Text style={styles.subtext}>{item.card_set}</Text>
            <Text style={styles.subtext}> #{item.number}</Text>
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleRemoveCardFromCategory(item.id)}>
        <Text style={styles.buttonRemove}>Retirer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground
      source={require('../../assets/fond.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#111" />

        {/* Le nouvel en-tête avec la flèche de retour et le titre sur la même ligne */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#C6B17A" />
          </TouchableOpacity>
          <Text style={styles.title}>{category.name}</Text>
          {/* Espacement vide pour centrer le titre, on peut aussi l'enlever pour un alignement à gauche */}
          <View style={styles.emptySpace} /> 
        </View>

        <View style={styles.centeredContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={22} color="#C6B17A" style={{ marginLeft: 8, marginRight: 2 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une carte..."
              placeholderTextColor="#C6B17A"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              underlineColorAndroid="transparent"
            />
            {!!searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={22} color="#C6B17A" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.headerControls}>
            <Text style={styles.subtitle}>Cartes dans la catégorie :</Text>
            <Text style={styles.counter}>{filteredCards.length} Cartes</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#C6B17A" style={{ marginTop: 30 }} />
          ) : (
            <FlatList
              data={filteredCards}
              keyExtractor={item => item.id.toString()}
              renderItem={renderCard}
              ListEmptyComponent={<Text style={styles.emptyMessage}>Aucune carte dans cette catégorie.</Text>}
              contentContainerStyle={{ paddingBottom: 30 + (insets.bottom || 0), paddingTop: 6 }}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={6}
              maxToRenderPerBatch={6}
              windowSize={6}
              showsVerticalScrollIndicator={false}                               // ← désactive la barre native
              style={[styles.flatList, Platform.OS === 'web' && styles.scrollWeb]} // ← masque sur web
            />
          )}

          <TouchableOpacity
            style={styles.importButton}
            onPress={handleImportFile}
            disabled={isImporting}
          >
            {isImporting ? (
              <ActivityIndicator size="small" color="#181818" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={22} color="#181818" style={{ marginRight: 8 }} />
                <Text style={styles.importButtonText}>Importer des cartes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  // Nouvelle en-tête pour la flèche et le titre
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
    // Plus de position absolue
    backgroundColor: 'transparent',
    padding: 10,
  },
  title: {
    flex: 1, // Permet au titre de prendre l'espace restant pour un meilleur centrage
    fontSize: 22,
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
  centeredContainer: {
    flex: 1,
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,20,0.85)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C6B17A',
    marginBottom: 5,
    height: 45,
  },
  searchInput: {
    flex: 1,
    color: '#C6B17A',
    fontSize: 15,
    paddingHorizontal: 10,
    height: '100%',
    backgroundColor: 'transparent',
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  subtitle: {
    fontSize: 15,
    color: '#C6B17A',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardContainer: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#23201A',
    backgroundColor: 'rgba(20,20,20,0.95)',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: '#fff',
    flexWrap: 'wrap',
    flex: 1,
    lineHeight: 20,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#C6B17A',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  nameStyle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C6B17A',
  },
  subtext: {
    fontSize: 13,
    color: '#fff',
  },
  buttonRemove: {
    color: '#fff',
    backgroundColor: '#FF5555',
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    marginLeft: 12,
  },
  counter: {
    color: '#FFF',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'right',
    minWidth: 24,
  },
  importButton: {
    backgroundColor: '#C6B17A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: '50%',
    alignSelf: 'center', // Centrer le bouton
  },
  importButtonText: {
    color: '#181818',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  flatList: {
    marginTop: 10,
    maxHeight: height * 0.70, // limite la hauteur de la liste pour ne pas tout prendre
  },
  scrollWeb: {
    scrollbarWidth: 'none',      // Firefox
    msOverflowStyle: 'none',     // IE et Edge Legacy
    '::-webkit-scrollbar': {     // Chrome, Safari et Edge Chromium
      display: 'none',
    },
  },
});

export default CategoryCardsScreen;
