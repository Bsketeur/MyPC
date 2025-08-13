import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  ImageBackground,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomAlertModal from '../components/CustomAlertModal';

const API_ADD_TO_COLLECTION = 'https://api-xwqa.onrender.com/api/cards/add-to-collection';
const API_CHECK_IN_COLLECTION = 'https://api-xwqa.onrender.com/api/cards/check-in-collection';
const API_UPDATE_IMAGE = 'https://api-xwqa.onrender.com/api/cards/update-image';
const API_BASE_URL = 'https://api-xwqa.onrender.com/api';
const API_SAVE_CARD = 'https://api-xwqa.onrender.com/api/cards/saved-cards';
const API_ADD_MARKET_ITEM = 'https://api-xwqa.onrender.com/api/marketplace/add';

const MAX_CONTAINER_WIDTH = 800;
const { width } = Dimensions.get('window');
const CARD_RATIO = 88 / 63;
const CARD_WIDTH = Math.min(width * 0.6, 300);
const CARD_HEIGHT = CARD_WIDTH * CARD_RATIO;

const CardDetailsSearchScreen = ({ route, navigation }) => {
  const { card, userId } = route.params;

  const [cardDetails, setCardDetails] = useState(card || null);
  const [loading, setLoading] = useState(true);
  const [isCardInCollection, setIsCardInCollection] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const insets = useSafeAreaInsets();
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [exchangeModalVisible, setExchangeModalVisible] = useState(false);
  const [sellPrice, setSellPrice] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [savedCardId, setSavedCardId] = useState(null);

  // États pour le CustomAlertModal
  const [isCustomAlertVisible, setIsCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertButtons, setCustomAlertButtons] = useState([]);

  // Fonction pour afficher l'alerte personnalisée
  const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => hideAlert() }]) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertButtons(buttons);
    setIsCustomAlertVisible(true);
  };

  // Fonction pour masquer l'alerte personnalisée
  const hideAlert = () => {
    setIsCustomAlertVisible(false);
    setCustomAlertTitle('');
    setCustomAlertMessage('');
    setCustomAlertButtons([]);
  };

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!userId || !cardDetails?.id) return;
      try {
        const response = await axios.get(`${API_SAVE_CARD}/${userId}`);
        const savedCards = response.data.savedCards || [];
        const savedCardEntry = savedCards.find(
          (saved) => saved.card_id === cardDetails.id
        );
        if (savedCardEntry) {
          setIsSaved(true);
          setSavedCardId(savedCardEntry.id);
        } else {
          setIsSaved(false);
          setSavedCardId(null);
        }
      } catch (error) {
        setIsSaved(false);
        setSavedCardId(null);
      }
    };
    checkFavoriteStatus();
  }, [userId, cardDetails]);

  const handleSaveCard = async () => {
    if (!userId || !cardDetails?.id) {
      showAlert('Erreur', "Impossible de sauvegarder la carte, informations manquantes.");
      return;
    }
    if (isSaved && savedCardId) {
      try {
        await axios.delete(`${API_SAVE_CARD}/${savedCardId}`);
        setIsSaved(false);
        setSavedCardId(null);
        showAlert('Carte retirée', "La carte a été retirée de vos favoris.");
      } catch (e) {
        showAlert('Erreur', `Impossible de retirer la carte des favoris.`);
      }
    } else {
      try {
        const res = await axios.post(API_SAVE_CARD, {
          userId,
          cardId: cardDetails.id,
          name: cardDetails.name,
          year: cardDetails.year,
          card_set: cardDetails.card_set,
          number: cardDetails.number,
          attributes: cardDetails.attributes,
        });
        if (res.data.success) {
          const response = await axios.get(`${API_SAVE_CARD}/${userId}`);
          const savedCards = response.data.savedCards || [];
          const newSavedCardEntry = savedCards.find(
            (saved) => saved.card_id === cardDetails.id
          );
          if (newSavedCardEntry) {
            setIsSaved(true);
            setSavedCardId(newSavedCardEntry.id);
            showAlert(
              'Carte sauvegardée',
              "Vous recevrez une notification si cette carte devient disponible à la vente ou à l'échange."
            );
          } else {
            showAlert('Erreur', "La carte a été ajoutée mais l'ID de favori n'a pas pu être récupéré.");
          }
        }
      } catch (e) {
        showAlert('Erreur', `Impossible de sauvegarder la carte.`);
      }
    }
  };

  useEffect(() => {
    const checkCardInCollection = async () => {
      try {
        if (!userId || !card?.id) {
          setLoading(false);
          return;
        }
        const res = await axios.post(API_CHECK_IN_COLLECTION, {
          userId,
          cards_id: card.id,
          name: card.name,
          year: card.year,
          card_set: card.card_set,
          number: card.number,
          attributes: card.attributes,
          photo: card.photo,
        });
        setIsCardInCollection(res.data.exists);
      } catch (error) {
        showAlert('Erreur', "Impossible de vérifier si la carte est dans votre collection.");
      } finally {
        setLoading(false);
      }
    };
    checkCardInCollection();
  }, [userId, card]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/users/${userId}/categories`);
        setCategories(res.data || []);
      } catch (error) {
        showAlert('Erreur', "Impossible de charger vos catégories.");
      }
    };
    fetchCategories();
  }, [userId]);

  const addToUserCollection = async () => {
    try {
      if (!userId || !cardDetails) {
        showAlert('Erreur', "Utilisateur ou détails de la carte manquants.");
        return;
      }
      const res = await axios.post(API_ADD_TO_COLLECTION, {
        userId,
        cards_id: cardDetails.id,
        name: cardDetails.name,
        year: cardDetails.year,
        card_set: cardDetails.card_set,
        number: cardDetails.number,
        attributes: cardDetails.attributes,
        photo: cardDetails.photo,
        categoryId: selectedCategory ? selectedCategory.id : null,
      });
      if (res.data.success) {
        setIsCardInCollection(true);
        showAlert('Succès', 'La carte a été ajoutée à votre collection.');
        setCategoryModalVisible(false);
      } else {
        showAlert('Erreur', res.data.message || "Impossible d'ajouter la carte.");
      }
    } catch (error) {
      showAlert('Erreur', "Impossible d'ajouter la carte à votre collection.");
    }
  };

  const uploadToCloudinary = async (imageUri) => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
    formData.append('upload_preset', 'mypcphoto');
    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/mypcapp/image/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.secure_url;
    } catch (error) {
      throw new Error("Échec de l'upload vers Cloudinary.");
    }
  };

  const updateImage = async (cloudinaryUrl) => {
    try {
      await axios.post(API_UPDATE_IMAGE, {
        cardId: cardDetails.id,
        image: cloudinaryUrl,
      });
      setCardDetails((prev) => ({ ...prev, photo: cloudinaryUrl }));
      showAlert('Succès', 'La photo a été ajoutée avec succès.');
    } catch (error) {
      showAlert('Erreur', "Impossible de mettre à jour l'image.");
    }
  };

  const pickImage = async () => {
    hideAlert();
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showAlert('Permission requise', "L'application nécessite l'accès à votre galerie.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 500 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      try {
        const cloudinaryUrl = await uploadToCloudinary(manipResult.uri);
        await updateImage(cloudinaryUrl);
      } catch (error) {
        showAlert('Erreur', "L'upload de l'image a échoué.");
      }
    }
  };

  const takePhoto = async () => {
    hideAlert();
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      showAlert('Permission requise', "L'application nécessite l'accès à la caméra pour prendre une photo.");
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 500 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      try {
        const cloudinaryUrl = await uploadToCloudinary(manipResult.uri);
        await updateImage(cloudinaryUrl);
      } catch (error) {
        showAlert('Erreur', "L'upload de l'image a échoué.");
      }
    }
  };

  const handleAddPhoto = () => {
    showAlert(
      "Ajouter une photo",
      "Choisissez une option",
      [
        { text: "Galerie", onPress: pickImage },
        { text: "Caméra", onPress: takePhoto },
        { text: "Annuler", onPress: hideAlert, style: "cancel" },
      ]
    );
  };

  const handleSellConfirmation = () => {
    setSellModalVisible(true);
  };

  const performSell = async () => {
    if (!userId || !cardDetails || !sellPrice) {
      showAlert('Erreur', "Veuillez entrer un prix de vente.");
      return;
    }
    if (isNaN(parseFloat(sellPrice)) || parseFloat(sellPrice) <= 0) {
      showAlert('Erreur', "Veuillez entrer un prix valide (nombre positif).");
      return;
    }
    try {
      const res = await axios.post(API_ADD_MARKET_ITEM, {
        user_id: userId,
        cards_id: cardDetails.id,
        name: cardDetails.name,
        year: cardDetails.year,
        card_set: cardDetails.card_set,
        number: cardDetails.number,
        attributes: cardDetails.attributes,
        photo: cardDetails.photo,
        type: 'Vente',
        prix: parseFloat(sellPrice),
      });
      if (res.data.success) {
        showAlert('Succès', 'La carte a été mise en vente sur le marketplace !');
        setSellModalVisible(false);
        setSellPrice('');
      } else {
        showAlert('Erreur', res.data.message || "Impossible de mettre la carte en vente.");
      }
    } catch (error) {
      showAlert('Erreur', "Une erreur est survenue lors de la mise en vente de la carte.");
    }
  };

  const handleExchangeConfirmation = () => {
    setExchangeModalVisible(true);
  };

  const performExchange = async () => {
    if (!userId || !cardDetails) {
      showAlert('Erreur', "Utilisateur ou détails de la carte manquants.");
      return;
    }
    try {
      const res = await axios.post(API_ADD_MARKET_ITEM, {
        user_id: userId,
        cards_id: cardDetails.id,
        name: cardDetails.name,
        year: cardDetails.year,
        card_set: cardDetails.card_set,
        number: cardDetails.number,
        attributes: cardDetails.attributes,
        photo: cardDetails.photo,
        type: 'Échange',
        prix: null,
      });
      if (res.data.success) {
        showAlert('Succès', 'La carte a été mise à l\'échange sur le marketplace !');
        setExchangeModalVisible(false);
      } else {
        showAlert('Erreur', res.data.message || "Impossible de mettre la carte à l'échange.");
      }
    } catch (error) {
      showAlert('Erreur', "Une erreur est survenue lors de la mise à l'échange de la carte.");
    }
  };

  if (loading) {
    return (
      <ImageBackground
        source={require('../../assets/fond.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C6B17A" />
        </View>
      </ImageBackground>
    );
  }

  if (!cardDetails) {
    return (
      <ImageBackground
        source={require('../../assets/fond.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.errorText}>Détails de la carte introuvables.</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/fond.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.outerContainer, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#C6B17A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={handleSaveCard}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={28}
              color={isSaved ? "#C6B17A" : "#FFFFFF"}
            />
          </TouchableOpacity>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: 40 + (insets.bottom || 0) }
            ]}
          >
            {cardDetails.photo ? (
              <Image source={{ uri: cardDetails.photo }} style={styles.image} />
            ) : (
              <TouchableOpacity onPress={handleAddPhoto}>
                <Image source={require('../../assets/placeholder.png')} style={styles.image} />
              </TouchableOpacity>
            )}
            <View style={styles.textContainer}>
              <Text style={styles.title}>{cardDetails.name}</Text>
              <Text style={styles.info}>
                {cardDetails.year} {cardDetails.card_set} #{cardDetails.number}
              </Text>
              {cardDetails.attributes ? (
                typeof cardDetails.attributes === 'object' && Object.keys(cardDetails.attributes).length > 0 ? (
                  <View style={styles.attributesContainer}>
                    {Object.entries(cardDetails.attributes).map(([key, value]) => (
                      <Text key={key} style={styles.attributeItem}>
                        <Text style={{ fontWeight: 'bold' }}>{key}</Text><Text>: {String(value)}</Text>
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.attributeItem}>{String(cardDetails.attributes)}</Text>
                )
              ) : null}

              {cardDetails.type && <Text style={styles.info}>Type : {cardDetails.type}</Text>}
              {cardDetails.price && <Text style={styles.info}>Prix estimé : {cardDetails.price} €</Text>}
            </View>

            {!isCardInCollection && (
              <>
                <TouchableOpacity style={styles.buttonAdd} onPress={() => setCategoryModalVisible(true)}>
                  <Text style={styles.buttonText}>Ajouter à ma collection</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.buttonMarketplace} onPress={handleSellConfirmation}>
              <Text style={styles.buttonText}>Mettre en vente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonMarketplace} onPress={handleExchangeConfirmation}>
              <Text style={styles.buttonText}>Mettre à l'échange</Text>
            </TouchableOpacity>

            <Modal isVisible={categoryModalVisible}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Choisissez une catégorie</Text>
                <TouchableOpacity
                  style={[
                    styles.modalCatButton,
                    selectedCategory === null && styles.modalCatButtonSelected,
                  ]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={[
                    styles.modalCatButtonText,
                    selectedCategory === null && styles.modalCatButtonTextSelected,
                  ]}>Aucune (juste dans la collection)</Text>
                </TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.modalCatButton,
                      selectedCategory?.id === cat.id && styles.modalCatButtonSelected,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[
                      styles.modalCatButtonText,
                      selectedCategory?.id === cat.id && styles.modalCatButtonTextSelected,
                    ]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.modalButtonConfirm} onPress={addToUserCollection}>
                  <Text style={styles.modalButtonText}>Valider</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => setCategoryModalVisible(false)}
                >
                  <Text style={styles.modalButtonText2}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </Modal>

            <Modal isVisible={sellModalVisible} onBackdropPress={() => setSellModalVisible(false)}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Mettre la carte en vente</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Prix de vente (€)"
                  placeholderTextColor="#AAA"
                  keyboardType="numeric"
                  value={sellPrice}
                  onChangeText={setSellPrice}
                />
                <TouchableOpacity style={styles.modalButtonConfirm} onPress={performSell}>
                  <Text style={styles.modalButtonText}>Confirmer la vente</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setSellModalVisible(false)}>
                  <Text style={styles.modalButtonText2}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </Modal>

            <Modal isVisible={exchangeModalVisible} onBackdropPress={() => setExchangeModalVisible(false)}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Confirmer la mise à l'échange</Text>
                <Text style={styles.modalMessage}>Voulez-vous vraiment mettre cette carte à l'échange sur le marketplace ?</Text>
                <TouchableOpacity style={styles.modalButtonConfirm} onPress={performExchange}>
                  <Text style={styles.modalButtonText}>Confirmer l'échange</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setExchangeModalVisible(false)}>
                  <Text style={styles.modalButtonText2}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </ScrollView>
        </View>
        <CustomAlertModal
          isVisible={isCustomAlertVisible}
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
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: '3%',
    width: '100%',
    maxWidth: MAX_CONTAINER_WIDTH,
    alignSelf: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 18,
    left: 10,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 10,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 10,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 16,
    width: '100%',
    maxWidth: MAX_CONTAINER_WIDTH,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  image: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    resizeMode: 'cover',
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C6B17A',
    backgroundColor: '#23201A',
    marginTop: 32,
  },
  textContainer: {
    width: '85%',
    alignSelf: 'center',
    marginBottom: 35,
    backgroundColor: 'rgba(20,20,20,0.82)',
    borderRadius: 8,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#C6B17A',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  info: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    fontWeight: 'bold',
  },
  attributesContainer: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.2)',
    width: '100%',
  },
  attributeItem: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 2,
    textAlign: 'center',
  },
  buttonAdd: {
    backgroundColor: '#C6B17A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    width: '80%',
    alignSelf: 'center',
  },
  buttonMarketplace: {
    backgroundColor: '#C6B17A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '80%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#181818',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: 'rgba(20,20,20,0.98)',
    padding: 22,
    borderRadius: 12,
    alignItems: 'center',
    width: '88%',
    maxWidth: 450,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C6B17A',
    marginBottom: 18,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalCatButton: {
    padding: 11,
    marginBottom: 10,
    backgroundColor: '#23201A',
    borderRadius: 7,
    width: '94%',
    alignSelf: 'center',
    borderWidth: 1.2,
    borderColor: '#C6B17A',
  },
  modalCatButtonSelected: {
    backgroundColor: '#C6B17A',
    borderColor: '#C6B17A',
  },
  modalCatButtonText: {
    color: '#C6B17A',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalCatButtonTextSelected: {
    color: '#181818',
  },
  modalButtonConfirm: {
    backgroundColor: '#C6B17A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    width: '94%',
    alignSelf: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
    borderColor: '#C6B17A',
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '94%',
    alignSelf: 'center',
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
  priceInput: {
    backgroundColor: '#23201A',
    borderColor: '#C6B17A',
    borderWidth: 1.2,
    borderRadius: 8,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '94%',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default CardDetailsSearchScreen;