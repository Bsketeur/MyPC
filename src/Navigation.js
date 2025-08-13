// src/Navigation/index.js

import React, { useEffect, useCallback, useState } from 'react';
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import SearchScreen from './screens/SearchScreen';
import AccountScreen from './screens/AccountScreen';
import DetailsScreen from './screens/DetailsScreen';
import CardDetailsScreen from './screens/CardDetailsScreen';
import SellerCardsScreen from './screens/SellerCardsScreen';
import UserCollectionScreen from './screens/UserCollectionScreen';
import UserMarketplaceScreen from './screens/UserMarketplaceScreen';
import AddCardScreen from './screens/AddCardScreen';
import ConversationsListScreen from './screens/ConversationsListScreen';
import MessageScreen from './screens/MessageScreen';
import CardDetailsSearchScreen from './screens/CardDetailsSearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddNewsScreen from './screens/AddNewsScreen';
import AdminScreen from './screens/AdminScreen';
import CategoryCardsScreen from './screens/CategoryCardsScreen';
import CguScreen from './screens/CGUScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import CartScreen from './screens/CartScreen';
import SavedCardsScreen from './screens/SavedCardsScreen';

import CustomTabBar from './components/CustomTabBar';

import { AuthProvider, useAuth } from './AuthProvider';
import { CartProvider, useCart } from './utils/CartContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ----- 1) HOME TABS (après connexion) -----
const HomeTabs = ({ route }) => {
  const { userId } = route.params || {};
  const { fetchCartData } = useCart();
  const [totalUnread, setTotalUnread] = useState(0);
  const insets = useSafeAreaInsets();
  const API_BASE_URL = 'https://api-xwqa.onrender.com/api';

  const fetchUnread = useCallback(async () => {
    if (!userId) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/conversations/unread/${userId}`);
      const json = await resp.json();
      setTotalUnread(json.totalUnread || 0);
    } catch (e) {
      console.error("Erreur unread:", e);
      setTotalUnread(0);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchUnread();
      fetchCartData();
    }, [fetchUnread, fetchCartData])
  );

  useEffect(() => {
    fetchUnread();
    fetchCartData();
  }, [fetchUnread, fetchCartData]);

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} totalUnread={totalUnread} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Accueil">
        {props => <HomeScreen {...props} userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="Boutique">
        {props => <MarketplaceScreen {...props} userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="Recherche">
        {props => <SearchScreen {...props} userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="Ma Collection">
        {props => <UserCollectionScreen {...props} userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="Mon compte">
        {props => <AccountScreen {...props} userId={userId} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// ----- 2) STACK AUTH (non connecté) -----
const AuthStack = () => (
  <Stack.Navigator
    initialRouteName="Welcome"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen
      name="CguScreen"
      component={CguScreen}
      options={{ title: 'Conditions Générales d’Utilisation' }}
    />
    <Stack.Screen
      name="PrivacyScreen"
      component={PrivacyScreen}
      options={{ title: 'Politique de Confidentialité' }}
    />
  </Stack.Navigator>
);

// ----- 3) STACK APP (connecté) -----
const AppStack = ({ userId }) => (
  <CartProvider userId={userId}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="HomeTabs"
        component={HomeTabs}
        initialParams={{ userId }}
      />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="CardDetailsScreen" component={CardDetailsScreen} />
      <Stack.Screen name="SellerCardsScreen" component={SellerCardsScreen} />
      <Stack.Screen name="UserCollectionScreen" component={UserCollectionScreen} />
      <Stack.Screen name="UserMarketplaceScreen" component={UserMarketplaceScreen} />
      <Stack.Screen name="AddCardScreen" component={AddCardScreen} />
      <Stack.Screen name="ConversationsListScreen" component={ConversationsListScreen} />
      <Stack.Screen name="MessageScreen" component={MessageScreen} />
      <Stack.Screen name="CardDetailsSearchScreen" component={CardDetailsSearchScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="AddNewsScreen" component={AddNewsScreen} />
      <Stack.Screen name="AdminScreen" component={AdminScreen} />
      <Stack.Screen
        name="CategoryCardsScreen"
        component={CategoryCardsScreen}
        options={{ title: 'Cartes de la catégorie' }}
      />
      <Stack.Screen
        name="CguScreen"
        component={CguScreen}
        options={{ title: 'Conditions Générales d’Utilisation' }}
      />
      <Stack.Screen
        name="PrivacyScreen"
        component={PrivacyScreen}
        options={{ title: 'Politique de Confidentialité' }}
      />
      <Stack.Screen
        name="SavedCardsScreen"
        component={SavedCardsScreen}
        options={{ title: 'Cartes Sauvegardées' }}
      />
      <Stack.Screen
        name="CartScreen"
        component={CartScreen}
        options={{ title: 'Panier' }}
      />
    </Stack.Navigator>
  </CartProvider>
);

// ----- 4) NAVIGATION CONDITIONNELLE -----
const AppNavigation = () => {
  const { user, userId, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#C6B17A" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user && userId ? <AppStack userId={userId} /> : <AuthStack />}
    </NavigationContainer>
  );
};

// ----- 5) PROVIDER RACINE -----
const RootNavigation = () => (
  <AuthProvider>
    <AppNavigation />
  </AuthProvider>
);

export default RootNavigation;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
