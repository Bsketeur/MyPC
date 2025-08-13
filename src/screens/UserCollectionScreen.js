import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
  TextInput,
  ImageBackground,
  SafeAreaView,
  Platform,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomAlertModal from '../components/CustomAlertModal';

const API_USER_COLLECTION = 'https://api-xwqa.onrender.com/api/users';

const UserCollectionScreen = (props) => {
  const navigation = useNavigation();
  const userId = props.userId || props.route?.params?.userId;
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Pour CustomAlertModal
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertButtons, setCustomAlertButtons] = useState([]);

  // Fonction utilitaire pour afficher le modal personnalisé
  const showAlert = (
    title,
    message,
    buttons = [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]
  ) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertButtons(buttons);
    setShowCustomAlert(true);
  };

  const fetchCategories = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_USER_COLLECTION}/${userId}/categories`);
      setCategories(
        res.data.map((category) => ({ ...category, cardCount: category.cardCount || 0 })) || []
      );
    } catch (error) {
      showAlert('Erreur', 'Erreur lors de la récupération des catégories.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      showAlert('Erreur', "Le nom de la catégorie ne peut pas être vide.");
      return;
    }
    try {
      await axios.post(`${API_USER_COLLECTION}/${userId}/categories`, { name: newCategoryName });
      setNewCategoryName('');
      setCategoryModalVisible(false);
      fetchCategories();
    } catch (error) {
      showAlert('Erreur', 'Impossible de créer la catégorie.');
    }
  };

  const handleDeleteCategory = (categoryId) => {
    showAlert('Supprimer la catégorie', 'Voulez-vous vraiment supprimer cette catégorie ?', [
      { text: 'Annuler', style: 'cancel', onPress: () => setShowCustomAlert(false) },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setShowCustomAlert(false);
          try {
            await axios.delete(`${API_USER_COLLECTION}/${userId}/categories/${categoryId}`);
            fetchCategories();
          } catch (error) {
            showAlert('Erreur', 'Impossible de supprimer la catégorie.');
          }
        },
      },
    ]);
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate('CategoryCardsScreen', { category: item, userId })}
      activeOpacity={0.85}
    >
      <View>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.cardCountText}>{item.cardCount} carte(s)</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
        <Text style={styles.deleteCatBtn}>✕</Text>
      </TouchableOpacity>
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
        <View style={[styles.innerContainer, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.title}>Ma Collection</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#C6B17A" style={{ marginTop: 30 }} />
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCategory}
              ListEmptyComponent={<Text style={styles.emptyText}>Aucune catégorie.</Text>}
              contentContainerStyle={{
                paddingBottom: 30 + (insets.bottom || 0),
                paddingTop: 10,
                width: '100%',
                maxWidth: 800,
                alignSelf: 'center',
              }}
              style={styles.flatList}
            />
          )}
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={() => setCategoryModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.addCategoryButtonText}>+ Ajouter une catégorie</Text>
          </TouchableOpacity>
          <Modal visible={categoryModalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Nouvelle catégorie</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nom de la catégorie"
                  placeholderTextColor="#C6B17A"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={styles.modalButtonCancel}
                    onPress={() => setCategoryModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText2}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleCreateCategory}>
                    <Text style={styles.modalButtonText}>Créer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
    maxWidth: 800, // Uniformisé avec Home/Marketplace/Search
    alignSelf: 'center',
    // SUPPRIME le paddingTop ici : on le gère dynamiquement via le composant
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
    marginTop: 0,
  },
  flatList: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    marginBottom: 0,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#23201A',
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderRadius: 12,
    marginBottom: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryName: {
    fontSize: 16,
    color: '#C6B17A',
    fontWeight: 'bold',
  },
  cardCountText: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 4,
  },
  deleteCatBtn: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  addCategoryButton: {
    backgroundColor: '#C6B17A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '50%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  addCategoryButtonText: {
    color: '#181818',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#C6B17A',
    textAlign: 'center',
    marginTop: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(20,20,20,0.98)',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '85%',
    borderWidth: 1,
    borderColor: '#23201A',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C6B17A',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#C6B17A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center',
    width: '90%',
    backgroundColor: 'rgba(20,20,20,0.85)',
    fontSize: 16,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
    borderColor: '#C6B17A',
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  modalButtonConfirm: {
    backgroundColor: '#C6B17A',
    borderRadius: 8,
    padding: 10,
    flex: 1,
    alignItems: 'center',
    marginLeft: 10,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#181818',
  },
  modalButtonText2: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C6B17A',
  },
});

export default UserCollectionScreen;