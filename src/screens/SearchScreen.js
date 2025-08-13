import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_URL = 'https://api-xwqa.onrender.com/api/cards/search';
const API_RANDOM = 'https://api-xwqa.onrender.com/api/cards/random?limit=20';

const CARD_WIDTH = 165;
const CARD_HEIGHT = 230;

const SearchScreen = (props) => {
  const userId = props.userId || props.route?.params?.userId;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [page, setPage] = useState(0);
  const [nbPages, setNbPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [randomCards, setRandomCards] = useState([]);
  const [randomLoading, setRandomLoading] = useState(true);

  const debounceTimeout = useRef(null);
  const intervalRef = useRef(null);

  const buildQueryParams = (pageNumber = page) => {
    const params = [];
    if (searchQuery.trim()) params.push(`q=${encodeURIComponent(searchQuery.trim())}`);
    params.push(`page=${pageNumber}`);
    params.push(`limit=20`);
    return params.length ? `?${params.join('&')}` : '';
  };

  const performSearch = async (pageNumber = 0) => {
    setLoading(true);
    try {
      setPage(pageNumber);
      const response = await fetch(`${API_URL}${buildQueryParams(pageNumber)}`);
      const data = await response.json();
      setSearchResults(data.results || []);
      setNbPages(data.nbPages || 1);
    } catch (error) {
      setSearchResults([]);
      setNbPages(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      performSearch(0);
    }, 400);
    return () => clearTimeout(debounceTimeout.current);
  }, [searchQuery]);

  const fetchRandomCards = async () => {
    setRandomLoading(true);
    try {
      const response = await fetch(API_RANDOM);
      const data = await response.json();
      setRandomCards(data.cards || data.results || []);
    } catch (error) {
      setRandomCards([]);
    }
    setRandomLoading(false);
  };

  useEffect(() => {
    fetchRandomCards();
    intervalRef.current = setInterval(fetchRandomCards, 10 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const showRandom = !searchQuery.trim();

  const renderMarketplaceCard = ({ item }) => {
    const imageUri = item.image_url || item.photo;
    const hasImage = !!imageUri && imageUri.trim() !== '';

    return (
      <TouchableOpacity
        style={styles.marketCardContainer}
        onPress={() =>
          navigation.navigate('CardDetailsSearchScreen', {
            card: { ...item, id: item.id, collection: 'cards' },
            userId,
          })
        }
        activeOpacity={0.9}
      >
        <View style={styles.marketImageBox}>
          {hasImage ? (
            <Image source={{ uri: imageUri }} style={styles.marketCardImage} resizeMode="contain" />
          ) : (
            <Image
              source={require('../../assets/placeholder.png')}
              style={styles.marketCardImage}
              resizeMode="contain"
            />
          )}
        </View>
        <View style={styles.marketCardInfo}>
          {/* NOM TOUJOURS SUR SA LIGNE */}
          <Text style={styles.marketName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          {/* SET + ANNEE EN DESSOUS */}
          <Text style={styles.marketSetYear} numberOfLines={2} ellipsizeMode="tail">
            {item.year} | {item.card_set}
          </Text>
          <Text style={styles.marketNumberAttr}>
            <Text style={styles.marketNumber}>#{item.number}</Text>
            {!!item.attributes && (
              <Text style={styles.marketAttr}> • {item.attributes}</Text>
            )}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/fond.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.innerContainer, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.title}>Recherche de cartes</Text>

          <TextInput
            style={styles.input}
            placeholder="Recherchez par Nom, Set ou Année"
            placeholderTextColor="#C6B17A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />

          {showRandom ? (
            <>
              <Text style={styles.randomSectionTitle}>Sélection aléatoire</Text>
              {randomLoading ? (
                <ActivityIndicator size="large" color="#C6B17A" style={{ marginVertical: 15 }} />
              ) : (
                <FlatList
                  data={randomCards}
                  keyExtractor={(item) => item.id?.toString()}
                  renderItem={renderMarketplaceCard}
                  numColumns={2}
                  columnWrapperStyle={{
                    justifyContent: 'center', // CENTRE les cartes sur chaque ligne
                    gap: 25,
                    marginBottom: 18,
                  }}
                  contentContainerStyle={{
                    paddingBottom: 30 + (insets.bottom || 0),
                    paddingTop: 6,
                    alignSelf: 'center',
                    width: '100%',
                    maxWidth: 800,
                  }}
                  ListEmptyComponent={<Text style={styles.emptyMessage}>Aucune carte aléatoire.</Text>}
                  showsVerticalScrollIndicator={false}
                  style={[styles.flatList, { width: '100%', maxWidth: 800, alignSelf: 'center' }]}
                />
              )}
            </>
          ) : (
            <>
              {loading && (
                <ActivityIndicator size="large" color="#C6B17A" style={{ marginVertical: 20 }} />
              )}
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderMarketplaceCard}
                numColumns={2}
                columnWrapperStyle={{
                  justifyContent: 'center', // CENTRE les cartes sur chaque ligne
                  gap: 25,
                  marginBottom: 18,
                }}
                contentContainerStyle={{
                  paddingBottom: 30 + (insets.bottom || 0),
                  paddingTop: 6,
                  alignSelf: 'center',
                  width: '100%',
                  maxWidth: 800,
                }}
                ListEmptyComponent={() =>
                  !loading && <Text style={styles.emptyMessage}>Aucun résultat trouvé.</Text>
                }
                showsVerticalScrollIndicator={false}
                style={[styles.flatList, { width: '100%', maxWidth: 800, alignSelf: 'center' }]}
              />
              {searchResults.length > 0 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[styles.searchButton, { marginHorizontal: 10 }]}
                    disabled={page <= 0 || loading}
                    onPress={() => performSearch(page - 1)}
                  >
                    <Text style={styles.searchButtonText}>Précédent</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageInfo}>
                    Page {page + 1} sur {nbPages}
                  </Text>
                  <TouchableOpacity
                    style={[styles.searchButton, { marginHorizontal: 10 }]}
                    disabled={page + 1 >= nbPages || loading}
                    onPress={() => performSearch(page + 1)}
                  >
                    <Text style={styles.searchButtonText}>Suivant</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
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
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: '3%',
    width: '100%',
    maxWidth: 800, // Uniformisé avec Home et Marketplace
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#C6B17A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    color: '#fff',
    backgroundColor: 'rgba(20,20,20,0.85)',
    fontSize: 16,
  },
  flatList: {
    marginBottom: 0,
  },
  marketCardContainer: {
    backgroundColor: 'rgba(30,30,30,0.97)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C6B17A55',
    marginHorizontal: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 4,
  },
  marketImageBox: {
    width: '100%',
    height: 130,
    backgroundColor: '#191919',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  marketCardImage: {
    width: '82%',
    height: '86%',
    borderRadius: 12,
    backgroundColor: '#23201A',
  },
  marketCardInfo: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    flex: 1,
    justifyContent: 'center',
  },
  marketName: {
    color: '#C6B17A',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  marketSetYear: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 1,
    width: '100%',
  },
  marketSet: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    maxWidth: 90,
  },
  marketYear: {
    color: '#fff',
    fontSize: 12,
  },
  marketNumberAttr: {
    color: '#fff',
    fontSize: 13,
    marginTop: 1,
  },
  marketNumber: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  marketAttr: {
    color: '#fff',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#C6B17A',
    textAlign: 'center',
    marginTop: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  pageInfo: {
    fontSize: 16,
    color: '#C6B17A',
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  searchButton: {
    backgroundColor: '#C6B17A',
    padding: 10,
    borderRadius: 8,
    minWidth: 90,
  },
  searchButtonText: {
    color: '#181818',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  randomSectionTitle: {
    fontSize: 18,
    color: '#C6B17A',
    fontWeight: 'bold',
    marginTop: 2,
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 2,
    letterSpacing: 0.7,
  },
});

export default SearchScreen;