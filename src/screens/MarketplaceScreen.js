import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Image,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const API_ALL = 'https://api-xwqa.onrender.com/api/marketplace/all';
const API_SEARCH = 'https://api-xwqa.onrender.com/api/marketplace/search';

const { width } = Dimensions.get('window');

const MarketplaceScreen = ({ navigation, userId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const buildQueryParams = () => {
    const params = [];
    if (searchQuery.trim()) params.push(`q=${encodeURIComponent(searchQuery.trim())}`);
    if (selectedPriceRange !== 'all') {
      if (selectedPriceRange === '0-10') {
        params.push('priceMin=0');
        params.push('priceMax=10');
      } else if (selectedPriceRange === '10-50') {
        params.push('priceMin=10');
        params.push('priceMax=50');
      } else if (selectedPriceRange === '50-999999') {
        params.push('priceMin=50');
        params.push('priceMax=999999');
      }
    }
    if (selectedType !== 'all') params.push(`type=${encodeURIComponent(selectedType)}`);
    return params.length ? `?${params.join('&')}` : '';
  };

  const refreshMarketplace = useCallback(async (showLoadingIndicator = false) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      const queryParams = buildQueryParams();
      const url = queryParams ? `${API_SEARCH}${queryParams}` : API_ALL;
      const response = await fetch(url);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du marketplace:", error);
      setSearchResults([]);
    } finally {
      if (showLoadingIndicator) setLoading(false);
    }
  }, [searchQuery, selectedPriceRange, selectedType]);

  useEffect(() => {
    refreshMarketplace(true);

    const interval = setInterval(() => {
      refreshMarketplace(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshMarketplace]);

  const performSearch = () => {
    refreshMarketplace(true);
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.annonceContainer}
      onPress={() =>
        navigation.navigate('Details', {
          item: { ...item, id: item.id, collection: 'marketplace' },
          userId,
          refreshMarketplace,
        })
      }
      activeOpacity={0.85}
    >
      <Image
        source={
          item.photo
            ? { uri: item.photo }
            : require('../../assets/placeholder.png')
        }
        style={styles.annonceImage}
      />
      <View style={styles.annonceContent}>
        <View style={styles.annonceHeader}>
          <Text style={styles.annonceTitle} numberOfLines={1}>{item.name}</Text>
        </View>
        <Text style={styles.annonceSub}>
          {item.year} {item.card_set}
        </Text>
        {item.attributes ? (
          typeof item.attributes === 'object' && Object.keys(item.attributes).length > 0 ? (
            <View style={styles.annonceAttributesContainer}>
              {Object.entries(item.attributes).map(([key, value]) => (
                <Text key={key} style={styles.annonceAttributeItem}>
                  <Text style={{ fontWeight: 'bold' }}>{key}</Text><Text>: {String(value)}</Text>
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.annonceAttributeItem}>#{item.number} {String(item.attributes)}</Text>
          )
        ) : (
          <Text style={styles.annonceAttributeItem}>#{item.number}</Text>
        )}
        {item.type && <Text style={styles.annonceType}>{item.type}</Text>}
        {item.prix && <Text style={styles.annoncePrice}>{item.prix} €</Text>}
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
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Marketplace</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom, année ou set"
            placeholderTextColor="#C6B17A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={performSearch}
          />

          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start' }}>
            <TouchableOpacity
              onPress={() => setFiltersVisible(!filtersVisible)}
              style={styles.toggleFiltersButton}
              activeOpacity={0.85}
            >
              <Text style={styles.toggleFiltersText}>
                {filtersVisible ? 'Masquer les Filtres' : 'Filtrer'}
              </Text>
            </TouchableOpacity>
          </View>

          {filtersVisible && (
            <View style={styles.filtersContainer}>
              <Text style={styles.filterLabel}>Prix</Text>
              <View style={styles.priceFilter}>
                <TouchableOpacity
                  onPress={() => setSelectedPriceRange('all')}
                  style={[
                    styles.priceButton,
                    selectedPriceRange === 'all' && styles.selectedPriceButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.priceButtonText,
                      selectedPriceRange === 'all' && styles.selectedPriceButtonText,
                    ]}
                  >
                    Tous les prix
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedPriceRange('0-10')}
                  style={[
                    styles.priceButton,
                    selectedPriceRange === '0-10' && styles.selectedPriceButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.priceButtonText,
                      selectedPriceRange === '0-10' && styles.selectedPriceButtonText,
                    ]}
                  >
                    Moins de 10€
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedPriceRange('10-50')}
                  style={[
                    styles.priceButton,
                    selectedPriceRange === '10-50' && styles.selectedPriceButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.priceButtonText,
                      selectedPriceRange === '10-50' && styles.selectedPriceButtonText,
                    ]}
                  >
                    10€ à 50€
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedPriceRange('50-999999')}
                  style={[
                    styles.priceButton,
                    selectedPriceRange === '50-999999' && styles.selectedPriceButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.priceButtonText,
                      selectedPriceRange === '50-999999' && styles.selectedPriceButtonText,
                    ]}
                  >
                    Plus de 50€
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.filterLabel}>Type</Text>
              <View style={styles.typeFilter}>
                <TouchableOpacity
                  onPress={() => setSelectedType('all')}
                  style={[
                    styles.typeButton,
                    selectedType === 'all' && styles.selectedTypeButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === 'all' && styles.selectedTypeButtonText,
                    ]}
                  >
                    Tous les types
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedType(selectedType === 'Vente' ? 'all' : 'Vente')}
                  style={[
                    styles.typeButton,
                    selectedType === 'Vente' && styles.selectedTypeButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === 'Vente' && styles.selectedTypeButtonText,
                    ]}
                  >
                    Vente
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedType(selectedType === 'Échange' ? 'all' : 'Échange')}
                  style={[
                    styles.typeButton,
                    selectedType === 'Échange' && styles.selectedTypeButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === 'Échange' && styles.selectedTypeButtonText,
                    ]}
                  >
                    Échange
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.searchButton} onPress={performSearch} activeOpacity={0.85}>
            <Text style={styles.searchButtonText}>Rechercher</Text>
          </TouchableOpacity>

          {loading && searchResults.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#C6B17A" />
              <Text style={styles.loadingText}>Chargement des annonces...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id?.toString() || item.objectID?.toString()}
              renderItem={renderCard}
              ListEmptyComponent={() =>
                <Text style={styles.emptyMessage}>Aucun résultat trouvé.</Text>
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 + (insets.bottom || 0) }}
              style={styles.flatList}
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
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20, // identique à HomeScreen pour un placement cohérent sur mobile et web
    paddingBottom: 30,
    paddingHorizontal: '3%',
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  searchInput: {
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
  toggleFiltersButton: {
    marginBottom: 14,
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: '#C6B17A',
    borderRadius: 8,
  },
  toggleFiltersText: {
    color: '#181818',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filtersContainer: {
    marginBottom: 10,
    width: '100%',
    backgroundColor: 'rgba(20,20,20,0.85)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#23201A',
  },
  filterLabel: {
    fontSize: 15,
    color: '#C6B17A',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  priceFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceButton: {
    backgroundColor: 'transparent',
    borderColor: '#C6B17A',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
  },
  selectedPriceButton: {
    backgroundColor: '#C6B17A',
  },
  selectedPriceButtonText: {
    color: '#181818',
    fontWeight: 'bold',
  },
  priceButtonText: {
    color: '#C6B17A',
    fontSize: 13,
    fontWeight: 'bold',
  },
  typeFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  typeButton: {
    backgroundColor: 'transparent',
    borderColor: '#C6B17A',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
    width: '32%',
    alignItems: 'center',
  },
  selectedTypeButton: {
    backgroundColor: '#C6B17A',
  },
  selectedTypeButtonText: {
    color: '#181818',
    fontWeight: 'bold',
  },
  typeButtonText: {
    color: '#C6B17A',
    fontSize: 13,
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#C6B17A',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 10,
    width: '100%',
  },
  searchButtonText: {
    color: '#181818',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  flatList: {
    width: '100%',
  },
  annonceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#23201A',
    marginBottom: 18,
    padding: 14,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  annonceImage: {
    width: 70,
    height: 90,
    borderRadius: 10,
    marginRight: 18,
    backgroundColor: '#222',
  },
  annonceContent: {
    flex: 1,
    justifyContent: 'center',
  },
  annonceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  annonceTitle: {
    color: '#C6B17A',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  annonceSub: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
  annonceAttributesContainer: {
    marginTop: 2,
    marginBottom: 2,
  },
  annonceAttributeItem: {
    color: '#fff',
    fontSize: 13,
  },
  annonceType: {
    color: '#C6B17A',
    fontSize: 13,
    marginTop: 2,
    fontWeight: 'bold',
  },
  annoncePrice: {
    color: '#C6B17A',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#C6B17A',
    textAlign: 'center',
    marginTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  loadingText: {
    color: '#C6B17A',
    fontSize: 18,
    marginTop: 10,
  },
});

export default MarketplaceScreen;