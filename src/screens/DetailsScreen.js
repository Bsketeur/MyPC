import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StatusBar,
    Platform,
    StyleSheet,
    Dimensions,
    ImageBackground,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../utils/CartContext';
import { useAuth } from '../AuthProvider';
import CustomAlertModal from '../components/CustomAlertModal';

const API_BASE_URL = 'https://api-xwqa.onrender.com/api';
const { width } = Dimensions.get('window');
const MAX_WIDTH = 800;

const DetailsScreen = ({ route, navigation }) => {
    const { item, refreshMarketplace } = route.params;

    const insets = useSafeAreaInsets();
    const { userId: currentUserId } = useAuth();
    const { addToCart } = useCart();

    const [sellerName, setSellerName] = useState('');
    const [addingToCart, setAddingToCart] = useState(false);

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

    // Gestion des IDs
    const sellerId = item?.ownerId || item?.user_id || item?.sellerId;

    useEffect(() => {
        if (!item || !sellerId) {
            showAlert(
                "Erreur de données",
                "Informations de la carte ou du vendeur manquantes. Veuillez revenir en arrière et réessayer.",
                [{ text: "OK", onPress: () => { setShowCustomAlert(false); navigation.goBack(); } }]
            );
            return;
        }

        const fetchSellerName = async () => {
            if (sellerId) {
                try {
                    const res = await axios.get(`${API_BASE_URL}/users/id/${sellerId}`);
                    setSellerName(res.data.pseudo || 'Vendeur inconnu');
                } catch (e) {
                    setSellerName('Vendeur inconnu');
                }
            }
        };
        fetchSellerName();
    }, [item, sellerId, navigation]);

    const handleContactSeller = async () => {
        if (!currentUserId) {
            showAlert("Erreur", "Vous devez être connecté pour contacter un vendeur.");
            return;
        }
        if (currentUserId === sellerId) {
            showAlert("Erreur", "Vous ne pouvez pas créer une conversation avec vous-même.");
            return;
        }

        try {
            const conversationId = currentUserId < sellerId
                ? `${currentUserId}_${sellerId}`
                : `${sellerId}_${currentUserId}`;

            await axios.post(`${API_BASE_URL}/conversations/create`, {
                conversation_id: conversationId,
                user_ids: [currentUserId, sellerId]
            });

            navigation.navigate('MessageScreen', {
                conversationId,
                currentUserId: currentUserId,
                otherUserId: sellerId,
                otherUserPseudo: sellerName,
            });
        } catch (error) {
            showAlert("Erreur", "Impossible d'ouvrir la conversation. Veuillez réessayer.");
        }
    };

    // Le bouton Ajouter au panier est désactivé (commenté)
    /*
    const handleAddToCart = async () => {
        if (!currentUserId) {
            showAlert("Connexion requise", "Veuillez vous connecter pour ajouter des articles au panier.");
            return;
        }
        if (currentUserId === sellerId) {
            showAlert("Erreur", "Vous ne pouvez pas ajouter vos propres cartes au panier.");
            return;
        }
        if (item.type !== 'Vente' || item.status !== 'available') {
            showAlert("Indisponible", "Cette carte n'est pas disponible à la vente ou a déjà été ajoutée au panier.");
            return;
        }

        setAddingToCart(true);
        const success = await addToCart(item);
        setAddingToCart(false);

        if (success) {
            if (typeof refreshMarketplace === 'function') {
                refreshMarketplace(); // Mise à jour immédiate du marketplace
            }
            showAlert(
                "Succès",
                "La carte a été ajoutée à votre panier !",
                [{ text: "OK", onPress: () => { setShowCustomAlert(false); navigation.goBack(); } }]
            );
        }
    };
    */

    if (!item) {
        return (
            <ImageBackground
                source={require('../../assets/fond.png')}
                style={styles.background}
                resizeMode="cover"
            >
                <SafeAreaView style={styles.loadingContainer} edges={['top', 'left', 'right']}>
                    <ActivityIndicator size="large" color="#C6B17A" />
                    <Text style={styles.loadingText}>Chargement des détails de la carte...</Text>
                    <TouchableOpacity style={styles.backButtonError} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Retour</Text>
                    </TouchableOpacity>
                </SafeAreaView>
                <CustomAlertModal
                    isVisible={showCustomAlert}
                    title={customAlertTitle}
                    message={customAlertMessage}
                    buttons={customAlertButtons}
                />
            </ImageBackground>
        );
    }

    const cardImage = item.photo || item.image || 'https://via.placeholder.com/320x440?text=Pas+de+photo';
    // const showAddToCartButton = item.type === 'Vente' && currentUserId !== sellerId;

    return (
        <ImageBackground
            source={require('../../assets/fond.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" backgroundColor="#111" />
            <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
                <View style={styles.centeredContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color="#C6B17A" />
                    </TouchableOpacity>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}
                        style={styles.scroll}
                    >
                        <Image source={{ uri: cardImage }} style={styles.image} />

                        <View style={styles.textContainer}>
                            {item.name ? <Text style={styles.title}>{item.name}</Text> : null}
                            {(item.year || item.set || item.card_set || item.number || item.attributes) ? (
                                <Text style={styles.meta}>
                                    {item.year ? `${item.year} ` : ''}
                                    {item.set || item.card_set ? `${item.set || item.card_set} ` : ''}
                                    {item.number ? `#${item.number}` : ''}
                                    {item.attributes ? ` ${item.attributes}` : ''}
                                </Text>
                            ) : null}
                            {item.type === 'Vente' && (item.price || item.prix) ? (
                                <Text style={styles.meta}>Prix : {(parseFloat(item.price || item.prix)).toFixed(2)} €</Text>
                            ) : null}
                            {item.type === 'Échange' ? (
                                <Text style={styles.meta}>Échange</Text>
                            ) : null}

                            <TouchableOpacity
                                onPress={() => navigation.navigate('SellerCards', { sellerId: sellerId, sellerName: sellerName || 'Inconnu' })}
                            >
                                <Text style={[styles.meta, styles.seller]}>Vendeur: {sellerName || 'Inconnu'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.buttonContainer, { marginBottom: insets.bottom || 18 }]}>
                            {/*
                            {showAddToCartButton && (
                                <TouchableOpacity
                                    style={[styles.buttonLeft, addingToCart && styles.buttonDisabled]}
                                    onPress={handleAddToCart}
                                    disabled={addingToCart}
                                >
                                    {addingToCart ? (
                                        <ActivityIndicator color="#1A1A1A" />
                                    ) : (
                                        <Text style={styles.buttonText}>Ajouter au panier</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                            */}
                            <TouchableOpacity
                                style={[styles.buttonRight, currentUserId === sellerId && styles.buttonDisabled]}
                                onPress={handleContactSeller}
                                disabled={currentUserId === sellerId}
                            >
                                <Text style={styles.buttonText}>Contacter le vendeur</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>

            <CustomAlertModal
                isVisible={showCustomAlert}
                title={customAlertTitle}
                message={customAlertMessage}
                buttons={customAlertButtons}
            />
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        paddingTop: 0,
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    centeredContainer: {
        flex: 1,
        width: '100%',
        maxWidth: MAX_WIDTH,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    scroll: {
        width: '100%',
    },
    scrollContent: {
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 90 : 90,
        paddingBottom: 40,
        width: '100%',
        maxWidth: MAX_WIDTH,
        alignSelf: 'center',
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 60,
        left: 10,
        zIndex: 10,
        backgroundColor: 'transparent',
        padding: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    loadingText: {
        color: '#C6B17A',
        marginTop: 10,
        fontSize: 16,
        textAlign: 'center',
    },
    backButtonError: {
        backgroundColor: '#C6B17A',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 20,
    },
    image: {
        width: width > MAX_WIDTH ? MAX_WIDTH * 0.55 : width * 0.6,
        height: width > MAX_WIDTH ? MAX_WIDTH * 0.75 : width * 0.9,
        resizeMode: 'cover',
        marginBottom: 22,
        alignSelf: 'center',
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1.5,
        borderColor: '#C6B17A',
        backgroundColor: '#23201A',
    },
    textContainer: {
        width: '85%',
        alignSelf: 'center',
        marginBottom: 35,
        backgroundColor: 'rgba(20,20,20,0.82)',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
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
    seller: {
        textDecorationLine: 'underline',
        fontWeight: 'bold',
        color: '#C6B17A',
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '90%',
        marginTop: 18,
        gap: 15,
    },
    buttonLeft: {
        backgroundColor: '#C6B17A',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: 145,
        marginRight: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.13,
        shadowRadius: 7,
        elevation: 2,
    },
    buttonRight: {
        backgroundColor: '#C6B17A',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: 165,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.13,
        shadowRadius: 7,
        elevation: 2,
    },
    buttonText: {
        color: '#181818',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#888',
        opacity: 0.6,
    },
});

export default DetailsScreen;