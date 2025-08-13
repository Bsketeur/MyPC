import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const API_MARKETPLACE = 'https://api-xwqa.onrender.com/api/marketplace';
const API_USERS = 'https://api-xwqa.onrender.com/api/users';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation, userId }) => {
  const [exchangeCards, setExchangeCards] = useState([]);
  const [saleCards, setSaleCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('Vente'); // "Vente" ou "Échange"
  const insets = useSafeAreaInsets();

  const fetchUserName = async (userId) => {
    if (!userId) return 'Utilisateur inconnu';
    try {
      const res = await axios.get(`${API_USERS}/id/${userId}`);
      return res.data.pseudo || 'Utilisateur inconnu';
    } catch {
      return 'Utilisateur inconnu';
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const cardsRes = await axios.get(`${API_MARKETPLACE}/all`);
          const cards = cardsRes.data || [];

          // Filtrage et tri des 10 dernières cartes pour l'échange
          const exchangeData = cards
            .filter((item) => item.type === 'Échange')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);

          // Filtrage et tri des 10 dernières cartes pour la vente
          const saleData = cards
            .filter((item) => item.type === 'Vente')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);

          // Récupération des noms de vendeurs pour les cartes d'échange
          const exchangeWithSeller = await Promise.all(
            exchangeData.map(async (item) => {
              const sellerName = await fetchUserName(item.user_id);
              return { ...item, sellerName };
            })
          );
          setExchangeCards(exchangeWithSeller);

          // Récupération des noms de vendeurs pour les cartes de vente
          const saleWithSeller = await Promise.all(
            saleData.map(async (item) => {
              const sellerName = await fetchUserName(item.user_id);
              return { ...item, sellerName };
            })
          );
          setSaleCards(saleWithSeller);
        } catch (error) {
          console.error("Erreur lors du chargement des cartes du marketplace:", error);
          // Optionnel : afficher une alerte à l'utilisateur
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, []) // Le tableau de dépendances vide signifie que cela s'exécute une seule fois au montage du composant.
  );

  const renderCardRow = ({ item }) => (
    <TouchableOpacity
      style={styles.annonceContainer}
      onPress={() => navigation.navigate('Details', { item, userId })}
      activeOpacity={0.8}
    >
      <Image
        // CORRECTION ICI : Utilisation de require pour l'image placeholder locale
        source={item.photo ? { uri: item.photo } : require('../../assets/placeholder.png')}
        style={styles.annonceImage}
      />
      <View style={styles.annonceContent}>
        <View style={styles.annonceHeader}>
          <Text style={styles.annonceTitle} numberOfLines={1}>{item.name}</Text>
        </View>
        <Text style={styles.annonceSub}>
          {item.year} {item.card_set}
        </Text>
        <Text style={styles.annonceSub}>
          #{item.number} {item.attributes}
        </Text>
        {item.prix && (
          <Text style={styles.annoncePrice}>{item.prix} €</Text>
        )}
        {item.sellerName && (
          <Text style={styles.annonceSeller}>{item.sellerName}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#C6B17A" />
      </View>
    );
  }

  const cardsToShow = selectedType === 'Vente' ? saleCards : exchangeCards;

  return (
    <ImageBackground
      source={require('../../assets/fond.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>MyPC</Text>
          <Text style={styles.annonceSub}>Bienvenue sur la seule application de gestion, échange, vente de cartes.</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.subtitleList} numberOfLines={1}>Dernières cartes ajoutées</Text>
            <View style={styles.switchRow}>
              <TouchableOpacity
                style={[
                  styles.switchBtn,
                  selectedType === 'Vente' && styles.switchBtnActive,
                ]}
                onPress={() => setSelectedType('Vente')}
              >
                <Text style={[
                  styles.switchBtnText,
                  selectedType === 'Vente' && styles.switchBtnTextActive,
                ]}>Vente</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.switchBtn,
                  selectedType === 'Échange' && styles.switchBtnActive,
                ]}
                onPress={() => setSelectedType('Échange')}
              >
                <Text style={[
                  styles.switchBtnText,
                  selectedType === 'Échange' && styles.switchBtnTextActive,
                ]}>Échange</Text>
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={cardsToShow}
            keyExtractor={(item, idx) => item.id ? item.id.toString() : idx.toString()}
            renderItem={renderCardRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 + (insets.bottom || 0), marginTop: 0 }}
            style={styles.flatList}
          />
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
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 0,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: '3%',
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C6B17A',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitleList: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C6B17A',
    flex: 1,
    textAlign: 'left',
    marginRight: 8,
    flexShrink: 1,
  },
  flatList: {
    width: '100%',
    marginBottom: 0,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    backgroundColor: '#181818',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#23201A',
    overflow: 'hidden',
    flexShrink: 0,
  },
  switchBtn: {
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  switchBtnActive: {
    backgroundColor: '#C6B17A',
  },
  switchBtnText: {
    color: '#C6B17A',
    fontWeight: 'bold',
    fontSize: 15,
  },
  switchBtnTextActive: {
    color: '#181818',
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
    backgroundColor: '#222', // Couleur de fond pour le placeholder
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
  annoncePrice: {
    color: '#C6B17A',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
  },
  annonceSeller: {
    color: '#C6B17A',
    fontSize: 13,
    marginTop: 2,
  },
});

export default HomeScreen;
