// src/utils/useNotifications.js

import { useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native'; // Ajout de Alert pour les messages
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import axios from 'axios'; // Assurez-vous d'avoir axios installé

// Configurez le gestionnaire de notifications pour qu'il s'affiche même lorsque l'application est au premier plan
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// URL de votre backend pour enregistrer les tokens
const API_REGISTER_PUSH_TOKEN = 'https://api-xwqa.onrender.com/api/notifications/register-token';

async function registerForPushNotificationsAsync(userId) {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Notification', 'Échec d\'obtenir le jeton push pour la notification ! Veuillez activer les notifications dans les paramètres de votre appareil.');
      return;
    }
    // Obtenez le jeton push
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);

    // Envoyez le token à votre backend
    if (userId && token) {
      try {
        await axios.post(API_REGISTER_PUSH_TOKEN, { userId, token });
        console.log('Token push enregistré sur le backend avec succès.');
      } catch (error) {
        console.error('Échec de l\'enregistrement du token push sur le backend:', error);
        // Alert.alert('Erreur', 'Impossible d\'enregistrer le jeton de notification sur le serveur.');
      }
    }
  } else {
    Alert.alert('Notification', 'Les notifications push doivent être testées sur un appareil physique ou un émulateur Android/iOS.');
  }

  return token;
}

// Hook personnalisé pour gérer les notifications push
export function usePushNotifications(userId) {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // N'enregistre le token que si un userId est fourni
    if (userId) {
      registerForPushNotificationsAsync(userId).then(token => {
        if (token) setExpoPushToken(token);
      });
    }

    // Ce listener s'active lorsque la notification est reçue en premier plan (app ouverte)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log('Notification reçue (premier plan):', notification);
      // Vous pouvez ici mettre à jour l'UI ou afficher un message personnalisé
    });

    // Ce listener s'active lorsque l'utilisateur clique sur la notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Réponse à la notification (clic):', response);
      // Exemple de navigation (vous devrez adapter ceci à votre système de navigation)
      // Si la notification contient des données comme { data: { cardId: 123 } }
      // const cardId = response.notification.request.content.data?.cardId;
      // if (cardId) {
      //   navigation.navigate('CardDetailsSearchScreen', { cardId: cardId, userId: userId });
      // }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [userId]); // Déclenchez l'enregistrement quand l'ID utilisateur est disponible

  return { expoPushToken, notification };
}
