import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const API_ACTUALITES = 'https://api-xwqa.onrender.com/api/actualites';

// À adapter : l'id MariaDB de l'admin
const ADMIN_ID = 1;

const AddNewsScreen = ({ navigation, route }) => {
  // On suppose que l'id utilisateur est passé dans les params
  const userId = route?.params?.userId;

  // LOG pour debug admin
  console.log('Params reçus dans AddNewsScreen :', route?.params);
  console.log('userId reçu :', userId, 'type:', typeof userId, '| ADMIN_ID:', ADMIN_ID);

  // Si l'utilisateur connecté n'est pas l'admin, on affiche un message d'alerte
  if (!userId || parseInt(userId, 10) !== ADMIN_ID) {
    console.log('Accès refusé : userId', userId, 'ADMIN_ID attendu', ADMIN_ID);
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#5B3A22" />
        </TouchableOpacity>
        <Text style={styles.errorText}>
          Accès interdit : vous n'êtes pas autorisé à accéder à cette page.
        </Text>
      </View>
    );
  }

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddNews = async () => {
    console.log('Tentative d\'ajout d\'actualité avec :', { title, description });
    if (!title.trim() || !description.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      console.log('Erreur : champs manquants');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(API_ACTUALITES, {
        title: title.trim(),
        description: description.trim(),
        // createdAt sera généré côté SQL (CURRENT_DATE ou NOW())
      });
      console.log('Réponse API ajout actualité :', response.data);
      Alert.alert('Succès', 'Actualité ajoutée.');
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'actualité :", error);
      Alert.alert('Erreur', "Une erreur est survenue lors de l'ajout de l'actualité.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Icône retour */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#5B3A22" />
      </TouchableOpacity>
      <Text style={styles.title}>Ajouter une Actualité</Text>
      <TextInput
        style={styles.input}
        placeholder="Titre"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#5B3A22"
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholderTextColor="#5B3A22"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleAddNews}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'En cours...' : 'Ajouter Actualité'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8d5b7',
    padding: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 20) + 10,
    left: 10,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#5B3A22',
  },
  input: {
    borderWidth: 1,
    borderColor: '#5B3A22',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: '#5B3A22',
  },
  button: {
    backgroundColor: '#5B3A22',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#e8d5b7',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 60,
  },
});

export default AddNewsScreen;
