import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Switch,
  StatusBar,
  FlatList,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  Platform,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const API_OPTIONS = 'https://api-xwqa.onrender.com/api/cards/options';
const API_EXISTS = 'https://api-xwqa.onrender.com/api/cards/exists';
const API_ADD_CARD = 'https://api-xwqa.onrender.com/api/cards/add';
const API_ADD_MARKET = 'https://api-xwqa.onrender.com/api/marketplace/add';

const AddCardScreen = ({ route, navigation }) => {
  // Champs carte
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [cardSet, setCardSet] = useState('');
  const [number, setNumber] = useState('');
  const [attributes, setAttributes] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState('');

  // Listes d'options
  const [namesList, setNamesList] = useState([]);
  const [yearsList, setYearsList] = useState([]);
  const [setsList, setSetsList] = useState([]);
  const [numbersList, setNumbersList] = useState([]);
  const [attributesList, setAttributesList] = useState([]);

  // Suggestions dynamiques
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [yearSuggestions, setYearSuggestions] = useState([]);
  const [setSuggestions, setSetSuggestions] = useState([]);
  const [numberSuggestions, setNumberSuggestions] = useState([]);
  const [attributesSuggestions, setAttributesSuggestions] = useState([]);

  // États pour masquer la liste après sélection
  const [hasSelectedName, setHasSelectedName] = useState(false);
  const [hasSelectedYear, setHasSelectedYear] = useState(false);
  const [hasSelectedSet, setHasSelectedSet] = useState(false);
  const [hasSelectedNumber, setHasSelectedNumber] = useState(false);
  const [hasSelectedAttributes, setHasSelectedAttributes] = useState(false);

  // Autres états
  const [isForSale, setIsForSale] = useState(false);
  const [isForTrade, setIsForTrade] = useState(false);

  const insets = useSafeAreaInsets();

  // Récupération des options depuis l'API
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch(API_OPTIONS);
        const data = await response.json();
        setNamesList(data.names || []);
        setYearsList(data.years || []);
        setSetsList(data.sets || []);
        setNumbersList(data.numbers || []);
        setAttributesList(data.attributes || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des options :', error);
      }
    };
    fetchOptions();
  }, []);

  // Suggestions dynamiques améliorées pour tous les champs
  useEffect(() => {
    if (name.length === 0 || hasSelectedName) {
      setNameSuggestions([]);
      return;
    }
    const lower = name.toLowerCase();
    const filtered = namesList.filter(
      (n) => n && !n.includes('/') && n.toLowerCase().includes(lower)
    );
    const exact = filtered.filter((n) => n.toLowerCase() === lower);
    const startsWith = filtered.filter((n) => n.toLowerCase().startsWith(lower) && n.toLowerCase() !== lower);
    const contains = filtered.filter(
      (n) => !n.toLowerCase().startsWith(lower) && n.toLowerCase() !== lower
    );
    setNameSuggestions([...exact, ...startsWith, ...contains]);
  }, [name, namesList, hasSelectedName]);

  useEffect(() => {
    if (year.length === 0 || hasSelectedYear) {
      setYearSuggestions([]);
      return;
    }
    const lower = year.toLowerCase();
    const filtered = yearsList.filter(
      (y) => y && !y.includes('/') && y.toLowerCase().includes(lower)
    );
    const exact = filtered.filter((y) => y.toLowerCase() === lower);
    const startsWith = filtered.filter((y) => y.toLowerCase().startsWith(lower) && y.toLowerCase() !== lower);
    const contains = filtered.filter(
      (y) => !y.toLowerCase().startsWith(lower) && y.toLowerCase() !== lower
    );
    setYearSuggestions([...exact, ...startsWith, ...contains]);
  }, [year, yearsList, hasSelectedYear]);

  useEffect(() => {
    if (cardSet.length === 0 || hasSelectedSet) {
      setSetSuggestions([]);
      return;
    }
    const lower = cardSet.toLowerCase();
    const filtered = setsList.filter(
      (s) => s && !s.includes('/') && s.toLowerCase().includes(lower)
    );
    const exact = filtered.filter((s) => s.toLowerCase() === lower);
    const startsWith = filtered.filter((s) => s.toLowerCase().startsWith(lower) && s.toLowerCase() !== lower);
    const contains = filtered.filter(
      (s) => !s.toLowerCase().startsWith(lower) && s.toLowerCase() !== lower
    );
    setSetSuggestions([...exact, ...startsWith, ...contains]);
  }, [cardSet, setsList, hasSelectedSet]);

  useEffect(() => {
    if (number.length === 0 || hasSelectedNumber) {
      setNumberSuggestions([]);
      return;
    }
    const lower = number.toLowerCase();
    const filtered = numbersList.filter(
      (n) => n && !n.includes('/') && n.toLowerCase().includes(lower)
    );
    const exact = filtered.filter((n) => n.toLowerCase() === lower);
    const startsWith = filtered.filter((n) => n.toLowerCase().startsWith(lower) && n.toLowerCase() !== lower);
    setNumberSuggestions([...exact, ...startsWith]);
  }, [number, numbersList, hasSelectedNumber]);

  useEffect(() => {
    if (attributes.length === 0 || hasSelectedAttributes) {
      setAttributesSuggestions([]);
      return;
    }
    const lower = attributes.toLowerCase();
    const filtered = attributesList.filter(
      (a) => a && !a.includes('/') && a.toLowerCase().includes(lower)
    );
    const exact = filtered.filter((a) => a.toLowerCase() === lower);
    const startsWith = filtered.filter((a) => a.toLowerCase().startsWith(lower) && a.toLowerCase() !== lower);
    const contains = filtered.filter(
      (a) => !a.toLowerCase().startsWith(lower) && a.toLowerCase() !== lower
    );
    setAttributesSuggestions([...exact, ...startsWith, ...contains]);
  }, [attributes, attributesList, hasSelectedAttributes]);

  // Upload Cloudinary
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
      console.error('Erreur lors du téléchargement vers Cloudinary :', error);
      throw error;
    }
  };

  // Sélection d'une image depuis la galerie
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission requise', "L'application nécessite l'accès à votre galerie pour sélectionner une image.");
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
        setImage(cloudinaryUrl);
      } catch (error) {
        Alert.alert('Erreur', "L'upload de l'image vers Cloudinary a échoué.");
      }
    }
  };

  // Prise de photo
  const takePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      Alert.alert('Permission requise', "L'application nécessite l'accès à la caméra pour prendre une photo.");
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
        setImage(cloudinaryUrl);
      } catch (error) {
        Alert.alert('Erreur', "L'upload de la photo vers Cloudinary a échoué.");
      }
    }
  };

  // Ajout de la carte
  const handleAddCard = async () => {
    const userId = route?.params?.userId;
    if (!userId) {
      Alert.alert("Erreur", "Vous devez être connecté pour effectuer cette action.");
      return;
    }
    const type = isForSale ? 'Vente' : isForTrade ? 'Échange' : '';
    if (!name || !year || !cardSet || !number) {
      Alert.alert('Erreur', 'Les champs Nom, Année, Set et Numéro sont obligatoires.');
      return;
    }
    if (type === 'Vente' && !price) {
      Alert.alert('Erreur', 'Veuillez indiquer un prix pour la carte.');
      return;
    }

    try {
      // Vérifier si la carte existe déjà
      const existsRes = await fetch(API_EXISTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          year,
          card_set: cardSet,
          number,
          attributes: attributes || null,
        }),
      });
      const existsData = await existsRes.json();

      let cardId = null;
      if (!existsData.exists) {
        // Ajouter la carte à la base
        const addRes = await fetch(API_ADD_CARD, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            year,
            card_set: cardSet,
            number,
            attributes: attributes || null,
            firebase_ID: userId,
            photo: image || null,
          }),
        });
        const addData = await addRes.json();
        cardId = addData.id;
      } else {
        cardId = existsData.card?.id;
      }

      // Ajout à la marketplace si vente ou échange
      if (isForSale || isForTrade) {
        await fetch(API_ADD_MARKET, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            cards_id: cardId,
            name,
            year,
            card_set: cardSet,
            number,
            attributes: attributes || null,
            photo: image || null,
            type,
            prix: type === 'Vente' ? price : null,
          }),
        });
      }

      Alert.alert('Succès', 'Carte ajoutée avec succès !');
      setName('');
      setYear('');
      setCardSet('');
      setNumber('');
      setAttributes('');
      setImage('');
      setPrice('');
      setIsForSale(false);
      setIsForTrade(false);
      setHasSelectedName(false);
      setHasSelectedYear(false);
      setHasSelectedSet(false);
      setHasSelectedNumber(false);
      setHasSelectedAttributes(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la carte :", error);
      Alert.alert('Erreur', "Une erreur est survenue lors de l'ajout.");
    }
  };

  const handleReset = () => {
    setName('');
    setYear('');
    setCardSet('');
    setNumber('');
    setAttributes('');
    setImage('');
    setPrice('');
    setIsForSale(false);
    setIsForTrade(false);
    setHasSelectedName(false);
    setHasSelectedYear(false);
    setHasSelectedSet(false);
    setHasSelectedNumber(false);
    setHasSelectedAttributes(false);
  };

  // Sélection d'une suggestion
  const selectSuggestion = (setter, value, clearSuggestions, setHasSelected) => {
    setHasSelected(true);
    setter(value);
    clearSuggestions([]);
  };

  return (
    <ImageBackground
      source={require('../../assets/fond.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {/* Flèche de retour en haut à gauche */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#C6B17A" />
        </TouchableOpacity>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: 40 + (insets.bottom || 0) } // Pour que rien ne soit masqué par la barre système
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageTitle}>Ajouter une carte</Text>

            {/* Champ Nom avec suggestions */}
            <TextInput
              style={styles.input}
              placeholder="Nom"
              placeholderTextColor="#C6B17A"
              value={name}
              onChangeText={text => {
                setName(text);
                setHasSelectedName(false);
              }}
              autoCapitalize="words"
            />
            {nameSuggestions.length > 0 && !hasSelectedName && (
              <FlatList
                data={nameSuggestions}
                keyExtractor={(item, idx) => item + idx}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => selectSuggestion(setName, item, setNameSuggestions, setHasSelectedName)}>
                    <Text style={styles.suggestion}>{item}</Text>
                  </TouchableOpacity>
                )}
                style={styles.suggestionList}
                keyboardShouldPersistTaps="handled"
              />
            )}

            {/* Champ Année avec suggestions */}
            <TextInput
              style={styles.input}
              placeholder="Année"
              placeholderTextColor="#C6B17A"
              value={year}
              onChangeText={text => {
                setYear(text);
                setHasSelectedYear(false);
              }}
              keyboardType="default"
            />
            {yearSuggestions.length > 0 && !hasSelectedYear && (
              <FlatList
                data={yearSuggestions}
                keyExtractor={(item, idx) => item + idx}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => selectSuggestion(setYear, item, setYearSuggestions, setHasSelectedYear)}>
                    <Text style={styles.suggestion}>{item}</Text>
                  </TouchableOpacity>
                )}
                style={styles.suggestionList}
                keyboardShouldPersistTaps="handled"
              />
            )}

            {/* Champ Set avec suggestions */}
            <TextInput
              style={styles.input}
              placeholder="Set"
              placeholderTextColor="#C6B17A"
              value={cardSet}
              onChangeText={text => {
                setCardSet(text);
                setHasSelectedSet(false);
              }}
            />
            {setSuggestions.length > 0 && !hasSelectedSet && (
              <FlatList
                data={setSuggestions}
                keyExtractor={(item, idx) => item + idx}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => selectSuggestion(setCardSet, item, setSetSuggestions, setHasSelectedSet)}>
                    <Text style={styles.suggestion}>{item}</Text>
                  </TouchableOpacity>
                )}
                style={styles.suggestionList}
                keyboardShouldPersistTaps="handled"
              />
            )}

            {/* Champ Numéro avec suggestions */}
            <TextInput
              style={styles.input}
              placeholder="Numéro"
              placeholderTextColor="#C6B17A"
              value={number}
              onChangeText={text => {
                setNumber(text);
                setHasSelectedNumber(false);
              }}
            />
            {numberSuggestions.length > 0 && !hasSelectedNumber && (
              <FlatList
                data={numberSuggestions}
                keyExtractor={(item, idx) => item + idx}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => selectSuggestion(setNumber, item, setNumberSuggestions, setHasSelectedNumber)}>
                    <Text style={styles.suggestion}>{item}</Text>
                  </TouchableOpacity>
                )}
                style={styles.suggestionList}
                keyboardShouldPersistTaps="handled"
              />
            )}

            {/* Champ Attributs avec suggestions */}
            <TextInput
              style={styles.input}
              placeholder="Attribut"
              placeholderTextColor="#C6B17A"
              value={attributes}
              onChangeText={text => {
                setAttributes(text);
                setHasSelectedAttributes(false);
              }}
            />
            {attributesSuggestions.length > 0 && !hasSelectedAttributes && (
              <FlatList
                data={attributesSuggestions}
                keyExtractor={(item, idx) => item + idx}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => selectSuggestion(setAttributes, item, setAttributesSuggestions, setHasSelectedAttributes)}>
                    <Text style={styles.suggestion}>{item}</Text>
                  </TouchableOpacity>
                )}
                style={styles.suggestionList}
                keyboardShouldPersistTaps="handled"
              />
            )}

            {/* Image */}
            <View style={styles.imageContainer}>
              <TouchableOpacity onPress={pickImage} style={styles.button}>
                <Text style={styles.buttonText}>Sélectionner une image</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={takePhoto} style={styles.button}>
                <Text style={styles.buttonText}>Prendre une photo</Text>
              </TouchableOpacity>
            </View>
            {image ? <Image source={{ uri: image }} style={styles.imagePreview} /> : null}

            {/* Switchs Vente/Echange */}
            <View style={styles.switchContainer}>
              <View style={styles.switchItem}>
                <Switch value={isForSale} onValueChange={setIsForSale} />
                <Text style={styles.switchText}>À vendre</Text>
              </View>
              <View style={styles.switchItem}>
                <Switch value={isForTrade} onValueChange={setIsForTrade} />
                <Text style={styles.switchText}>À échanger</Text>
              </View>
            </View>

            {isForSale && (
              <TextInput
                style={styles.input}
                placeholder="Prix"
                placeholderTextColor="#C6B17A"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleAddCard} style={styles.button}>
                <Text style={styles.buttonText}>Ajouter la carte</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReset} style={styles.button}>
                <Text style={styles.buttonText}>Réinitialiser</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
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
  scrollContent: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    // Le paddingBottom est ajouté dynamiquement pour le safe area !
    paddingHorizontal: '3%',
 
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 60,
    left: 10,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 10,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 30,
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#C6B17A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
    width: '90%',
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(20,20,20,0.85)',
  },
  suggestionList: {
    maxHeight: 80,
    width: '90%',
    borderColor: '#C6B17A',
    borderWidth: 1,
    borderTopWidth: 0,
    marginBottom: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(20,20,20,0.98)',
    borderRadius: 0,
  },
  suggestion: {
    padding: 8,
    fontSize: 15,
    color: '#C6B17A',
    borderBottomWidth: 1,
    borderBottomColor: '#23201A',
  },
  button: {
    backgroundColor: '#C6B17A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  buttonText: {
    color: '#181818',
    fontSize: 13,
    fontWeight: 'bold',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginBottom: 20,
  },
  imagePreview: {
    width: 80,
    height: 110,
    borderRadius: 8,
    marginTop: 20,
    resizeMode: 'cover',
    alignSelf: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginBottom: 20,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    color: '#C6B17A',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
});

export default AddCardScreen;