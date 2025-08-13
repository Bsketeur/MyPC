import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ScrollView,
  Platform,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomAlertModal from '../components/CustomAlertModal';

const API_DELETE_FROM_COLLECTION = 'https://api-xwqa.onrender.com/api/cards/delete';
const API_MARKETPLACE = 'https://api-xwqa.onrender.com/api/marketplace/add';
const API_UPDATE_IMAGE = 'https://api-xwqa.onrender.com/api/cards/update-image';
const API_GET_CARD = 'https://api-xwqa.onrender.com/api/cards';

const MAX_CONTAINER_WIDTH = 800;
const { width } = Dimensions.get('window');
const CARD_RATIO = 88 / 63;
const CARD_WIDTH = Math.min(width * 0.6, 350);
const CARD_HEIGHT = CARD_WIDTH * CARD_RATIO;

const CardDetailsScreen = ({ route, navigation }) => {
  const { card, userId } = route.params;
  const [cardDetails, setCardDetails] = useState(null);
  const [price, setPrice] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
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

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const cardId = card.cards_id || card.id;
        const res = await axios.get(`${API_GET_CARD}/${cardId}`);
        setCardDetails(res.data);
      } catch (error) {
        setCardDetails(card);
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
    // eslint-disable-next-line
  }, []);

  const deleteFromUserCollection = async () => {
    try {
      const cardId = cardDetails.cards_id || cardDetails.id;
      if (!userId || !cardId) return false;
      const res = await axios.post(API_DELETE_FROM_COLLECTION, {
        userId,
        cards_id: cardId,
      });
      return res.data.success;
    } catch (error) {
      return false;
    }
  };

  const transferToMarketplace = async (type, prix = null) => {
    try {
      if (!userId || !cardDetails) return;
      const cardId = cardDetails.cards_id || cardDetails.id;
      const res = await axios.post(API_MARKETPLACE, {
        user_id: userId,
        cards_id: cardId,
        name: cardDetails.name ?? '',
        year: cardDetails.year ?? '',
        card_set: cardDetails.card_set ?? cardDetails.set ?? '',
        number: cardDetails.number ?? '',
        attributes: cardDetails.attributes ?? null,
        photo: cardDetails.photo ?? null,
        type: type ?? '',
        prix: prix ?? null,
      });
      if (res.data.success) {
        const deleted = await deleteFromUserCollection();
        if (deleted) {
          showAlert('Succès', `Carte ajoutée à la marketplace (${type})`, [
            { text: 'OK', onPress: () => { setShowCustomAlert(false); navigation.goBack(); } }
          ]);
        } else {
          showAlert('Erreur', "Carte ajoutée à la marketplace mais non supprimée de votre collection.");
        }
      } else {
        showAlert('Erreur', res.data.message || "Impossible d'ajouter à la marketplace.");
      }
    } catch (error) {
      showAlert('Erreur', "Impossible d'ajouter à la marketplace.");
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
      throw error;
    }
  };

  const updateImage = async (cloudinaryUrl) => {
    try {
      const cardId = cardDetails.cards_id || cardDetails.id;
      await axios.post(API_UPDATE_IMAGE, {
        cardId,
        image: cloudinaryUrl,
      });
      const res = await axios.get(`${API_GET_CARD}/${cardId}`);
      setCardDetails(res.data);
    } catch (error) {
      showAlert('Erreur', "Impossible de mettre à jour l'image.");
    }
  };

  const pickImage = async () => {
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
        showAlert('Succès', 'La photo a été mise à jour.');
      } catch (error) {
        showAlert('Erreur', "L'upload de l'image a échoué.");
      }
    }
  };

  const takePhoto = async () => {
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
        showAlert('Succès', 'La photo a été mise à jour.');
      } catch (error) {
        showAlert('Erreur', "L'upload de l'image a échoué.");
      }
    }
  };

  const handleAddPhoto = () => {
    showAlert(
      'Ajouter une photo',
      'Choisissez une option',
      [
        { text: 'Galerie', onPress: () => { setShowCustomAlert(false); pickImage(); } },
        { text: 'Caméra', onPress: () => { setShowCustomAlert(false); takePhoto(); } },
        { text: 'Annuler', style: 'cancel', onPress: () => setShowCustomAlert(false) },
      ]
    );
  };

  const handleConfirm = () => {
    if (!price) {
      showAlert('Erreur', 'Veuillez entrer un prix valide.');
      return;
    }
    transferToMarketplace('Vente', price);
    setIsModalVisible(false);
    setPrice('');
  };

  const openPriceModal = () => {
    setIsModalVisible(true);
  };

  const handleDeleteCard = async () => {
    showAlert(
      "Supprimer la carte",
      "Voulez-vous vraiment supprimer cette carte de votre collection ?",
      [
        { text: "Annuler", style: "cancel", onPress: () => setShowCustomAlert(false) },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setShowCustomAlert(false);
            const deleted = await deleteFromUserCollection();
            if (deleted) {
              showAlert('Succès', 'La carte a été supprimée de votre collection.', [
                { text: 'OK', onPress: () => { setShowCustomAlert(false); navigation.goBack(); } }
              ]);
            } else {
              showAlert('Erreur', "Impossible de supprimer la carte.");
            }
          }
        }
      ]
    );
  };

  if (loading || !cardDetails) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181818' }}>
        <ActivityIndicator size="large" color="#C6B17A" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/fond.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.outerContainer, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#C6B17A" />
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
              <Text style={styles.meta}>
                {cardDetails.year} {cardDetails.card_set || cardDetails.set} #{cardDetails.number}
              </Text>
              {cardDetails.attributes && <Text style={styles.meta}>{cardDetails.attributes}</Text>}
              {cardDetails.price && <Text style={styles.meta}>Prix : {cardDetails.price} €</Text>}
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={openPriceModal}>
                <Text style={styles.buttonText}>Vendre</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => transferToMarketplace('Échange')}
              >
                <Text style={styles.buttonText}>Échanger</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonDelete}
                onPress={handleDeleteCard}
              >
                <Text style={styles.buttonTextDelete}>Supprimer</Text>
              </TouchableOpacity>
            </View>
            {isModalVisible && (
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Ajouter un prix</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Prix"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  placeholderTextColor="#C6B17A"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButtonCancel}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText2}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleConfirm}>
                    <Text style={styles.modalButtonText}>Valider</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
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
  scrollContent: {
    alignItems: 'center',
    paddingTop: 16,
    width: '100%',
    maxWidth: MAX_CONTAINER_WIDTH,
    alignSelf: 'center',
  },
  image: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    resizeMode: 'cover',
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 5,
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
  meta: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    width: '93%',
    maxWidth: 550,
    alignSelf: 'center',
    marginBottom: 18,
  },
  button: {
    backgroundColor: '#C6B17A',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 3,
    minWidth: 85,
  },
  buttonDelete: {
    backgroundColor: '#FF5555',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 3,
    minWidth: 85,
  },
  buttonText: {
    color: '#181818',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonTextDelete: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalContent: {
    backgroundColor: 'rgba(20,20,20,0.98)',
    padding: 22,
    borderRadius: 12,
    alignItems: 'center',
    width: '88%',
    maxWidth: 450,
    alignSelf: 'center',
    position: 'absolute',
    top: '40%',
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
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#C6B17A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    color: '#C6B17A',
    textAlign: 'center',
    width: '80%',
    backgroundColor: 'rgba(32,32,32,0.92)',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
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
    fontSize: 12,
    fontWeight: 'bold',
    color: '#181818',
  },
  modalButtonText2: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C6B17A',
  },
});

export default CardDetailsScreen;