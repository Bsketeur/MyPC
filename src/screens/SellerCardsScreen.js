import React, { useEffect, useState } from 'react';
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
  Dimensions,
  Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const API_MARKETPLACE = 'https://api-xwqa.onrender.com/api/marketplace';
const { width } = Dimensions.get('window');
const MAX_WIDTH = 800;

const SellerCardsScreen = ({ route, navigation }) => {
  const { sellerId, sellerName } = route.params;
  const [cards, setCards] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchSellerCards = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_MARKETPLACE}/user/${sellerId}`);
        setCards(res.data || []);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des cartes du vendeur :', error);
        setError('Impossible de charger les cartes.');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerCards();
  }, [sellerId]);

  const renderCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Details', { item, sellerName })}
      activeOpacity={0.85}
    >
      <View style={styles.cardContainer}>
        <Image
          source={{ uri: item.photo || 'https://via.placeholder.com/100' }}
          style={styles.cardImage}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardMeta}>
            {item.year} {item.card_set} #{item.number}
          </Text>
          <Text style={styles.cardType}>Type : {item.type}</Text>
          {item.type === 'Vente' && item.prix && (
            <Text style={styles.cardPrice}>Prix : {item.prix} €</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
          {/* Icône retour */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#C6B17A" />
          </TouchableOpacity>
          {/* Nom du vendeur */}
          <Text style={styles.title}>Cartes de {sellerName}</Text>
          {/* Affichage des erreurs */}
          {error && <Text style={styles.error}>{error}</Text>}
          {loading ? (
            <ActivityIndicator size="large" color="#C6B17A" style={{ marginTop: 30 }} />
          ) : (
            <FlatList
              data={cards}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Aucune carte trouvée pour ce vendeur.</Text>
              }
              renderItem={renderCard}
              style={styles.list}
              contentContainerStyle={{ paddingBottom: 35 + (insets.bottom || 0), paddingTop: 5 }}
              showsVerticalScrollIndicator={true}
            />
          )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 18,
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  list: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#C6B17A',
    marginTop: 20,
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
    color: '#C6B17A',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  cardType: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  cardPrice: {
    fontSize: 14,
    color: '#C6B17A',
    fontWeight: 'bold',
    marginTop: 7,
  },
});

export default SellerCardsScreen;