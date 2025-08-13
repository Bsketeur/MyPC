import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../utils/CartContext'; // Assurez-vous que le chemin est correct

// Ce composant remplace la barre de navigation par défaut
const CustomTabBar = ({ state, descriptors, navigation, totalUnread }) => {
  const insets = useSafeAreaInsets();
  const { cartCount } = useCart(); // Récupère le nombre d'articles du panier via le contexte

  return (
    // Conteneur extérieur qui prend 100% de la largeur avec le fond noir
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      
      {/* Conteneur intérieur qui est centré et a une largeur max de 800px */}
      <View style={styles.tabBarInnerContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

          let iconName;
          let showBadge = false;
          let badgeValue = 0;

          // Logique pour les icônes et les badges (similaire à votre code original)
          switch (route.name) {
            case 'Accueil':
              iconName = isFocused ? 'home' : 'home-outline';
              break;
            case 'Boutique':
              iconName = isFocused ? 'storefront' : 'storefront-outline';
              break;
            case 'Recherche':
              iconName = isFocused ? 'search' : 'search-outline';
              break;
            case 'Ma Collection':
              iconName = isFocused ? 'albums' : 'albums-outline';
              break;
            case 'Mon compte':
              iconName = isFocused ? 'person' : 'person-outline';
              showBadge = true;
              badgeValue = totalUnread;
              break;
            default:
              iconName = 'ellipse';
          }
           // Vous pouvez ajouter un cas pour 'Panier' si vous voulez qu'il soit visible ici

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabButton}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={iconName} size={24} color={isFocused ? '#C6B17A' : '#bbb'} />
                {showBadge && badgeValue > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeValue}</Text>
                  </View>
                )}
              </View>
              <Text style={{ color: isFocused ? '#C6B17A' : '#bbb', fontSize: 13, fontWeight: 'bold' }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Le conteneur parent : fond noir, pleine largeur
  tabBarContainer: {
    backgroundColor: '#111',
    borderTopColor: '#23201A',
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  // Le conteneur enfant : centré avec une largeur max
  tabBarInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    maxWidth: 800,      // <--- LA LARGEUR MAXIMALE
    alignSelf: 'center', // <--- POUR LE CENTRER
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
   
  },
});

export default CustomTabBar;