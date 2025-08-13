import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCart } from '../utils/CartContext';
import { useAuth } from '../AuthProvider';
import * as Linking from 'expo-linking';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomAlertModal from '../components/CustomAlertModal';

const API_BASE_URL = 'https://api-xwqa.onrender.com/api';

const CartScreen = () => {
    const navigation = useNavigation();
    const {
        cartItems,
        cartCount,
        subtotal,
        selectedShippingOption,
        totalAmount,
        loadingCart,
        removeFromCart,
        selectShippingOption,
        proceedToPayment,
        setShippingOptions,
        fetchCartData
    } = useCart();

    const { userId } = useAuth();
    const [userProfileAddress, setUserProfileAddress] = useState('');
    const [userProfilePostalCode, setUserProfilePostalCode] = useState('');
    const [userProfileCity, setUserProfileCity] = useState('');
    const [userProfileCountry, setUserProfileCountry] = useState('');
    const [userProfileFullName, setUserProfileFullName] = useState('');

    const [postalCode, setPostalCode] = useState('');
    const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);
    const [isSearchingPoints, setIsSearchingPoints] = useState(false);
    const [baseShippingOptions, setBaseShippingOptions] = useState([]);
    const [displayedShippingOptions, setDisplayedShippingOptions] = useState([]);
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
        const linkingPrefix = Linking.createURL('/');
        const handleDeepLink = async (event) => {
            const url = event.url;
            if (url && url.startsWith(linkingPrefix)) {
                const { path, queryParams } = Linking.parse(url);
                if (path === 'order-success') {
                    showAlert('Paiement Réussi', `Votre commande #${queryParams.orderId} a été confirmée !`, [
                        { text: 'OK', onPress: () => { setShowCustomAlert(false); navigation.navigate('OrderConfirmationScreen', { orderId: queryParams.orderId }); fetchCartData(); } }
                    ]);
                } else if (path === 'order-cancel') {
                    showAlert('Paiement Annulé', `La commande #${queryParams.orderId} a été annulée.`);
                } else if (path === 'order-error') {
                    showAlert('Erreur de Paiement', `Une erreur est survenue pour la commande #${queryParams.orderId || 'inconnue'}. ${queryParams.message || ''}`);
                }
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);
        Linking.getInitialURL().then(url => {
            if (url) {
                handleDeepLink({ url });
            }
        });

        return () => {
            subscription.remove();
        };
    }, [navigation, fetchCartData, userId]);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            try {
                const userResponse = await fetch(`${API_BASE_URL}/users/id/${userId}`);
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUserProfileAddress(userData.address || '');
                    setUserProfilePostalCode(userData.postal_code || '');
                    setUserProfileCity(userData.city || '');
                    setUserProfileCountry(userData.country || '');
                    setUserProfileFullName(`${userData.last_name || ''} ${userData.first_name || ''}`.trim());
                    setPostalCode(userData.postal_code || '');
                } else {
                    const errorText = await userResponse.text();
                    showAlert('Erreur de profil', `Impossible de charger votre profil: ${errorText}`);
                }
            } catch (error) {
                showAlert('Erreur réseau', `Impossible de récupérer le profil utilisateur: ${error.message}`);
            }

            try {
                const shippingResponse = await fetch(`${API_BASE_URL}/shipping-options`);
                if (shippingResponse.ok) {
                    const data = await shippingResponse.json();
                    const initialBaseOptions = data.filter(opt =>
                        opt.type !== 'point_relais' || !opt.isSpecificPoint
                    );
                    setBaseShippingOptions(initialBaseOptions);
                    setDisplayedShippingOptions(initialBaseOptions);
                    setShippingOptions(initialBaseOptions);
                } else {
                    const errorText = await shippingResponse.text();
                    setBaseShippingOptions([]);
                    setDisplayedShippingOptions([]);
                    setShippingOptions([]);
                    showAlert('Erreur', `Impossible de charger les options de livraison: ${errorText}`);
                }
            } catch (error) {
                setBaseShippingOptions([]);
                setDisplayedShippingOptions([]);
                setShippingOptions([]);
                showAlert('Erreur', `Impossible de récupérer les options de livraison: ${error.message}`);
            }
        };
        fetchData();
    }, [userId, setShippingOptions]);

    const handleSearchPointRelais = async () => {
        if (!postalCode.trim() || postalCode.trim().length !== 5) {
            showAlert('Erreur', 'Veuillez entrer un code postal valide (5 chiffres).');
            return;
        }

        setIsSearchingPoints(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simuler un délai réseau
            const simulatedPoints = [
                { id: `PR-${postalCode}-1`, name: `Point Relais A (${postalCode})`, description: 'Tabac du Centre, 12 Rue Principale', price: 3.49, type: 'point_relais', isSpecificPoint: true },
                { id: `PR-${postalCode}-2`, name: `Point Relais B (${postalCode})`, description: 'Supermarché Express, 5 Av. de la Gare', price: 3.49, type: 'point_relais', isSpecificPoint: true },
                { id: `PR-${postalCode}-3`, name: `Point Relais C (${postalCode})`, description: 'Boulangerie du Coin, 20 Place de l\'Église', price: 3.49, type: 'point_relais', isSpecificPoint: true },
            ];

            const baseOptionsWithoutGenericRelay = baseShippingOptions.filter(opt =>
                !(opt.type === 'point_relais' && !opt.isSpecificPoint)
            );

            const updatedDisplayedOptions = [...baseOptionsWithoutGenericRelay, ...simulatedPoints];
            setDisplayedShippingOptions(updatedDisplayedOptions);
            setShippingOptions(updatedDisplayedOptions);

            if (simulatedPoints.length > 0) {
                selectShippingOption(simulatedPoints[0]);
                showAlert('Succès', `Points relais trouvés pour le code postal ${postalCode}.`);
            } else {
                showAlert('Info', 'Aucun point relais trouvé pour ce code postal.');
                const mainRelayOption = baseShippingOptions.find(opt => opt.type === 'point_relais' && !opt.isSpecificPoint);
                selectShippingOption(mainRelayOption || null);
                setDisplayedShippingOptions(baseShippingOptions);
                setShippingOptions(baseShippingOptions);
            }
        } catch (error) {
            showAlert('Erreur', "Impossible de rechercher les points relais.");
            setDisplayedShippingOptions(baseShippingOptions);
            setShippingOptions(baseShippingOptions);
            const mainRelayOption = baseShippingOptions.find(opt => opt.type === 'point_relais' && !opt.isSpecificPoint);
            selectShippingOption(mainRelayOption || null);
        } finally {
            setIsSearchingPoints(false);
        }
    };

    const handlePostalCodeChange = (text) => {
        setPostalCode(text);
        setDisplayedShippingOptions(baseShippingOptions);
        setShippingOptions(baseShippingOptions);
        if (selectedShippingOption?.type === 'point_relais' && selectedShippingOption.isSpecificPoint) {
            const mainRelayOption = baseShippingOptions.find(opt => opt.type === 'point_relais' && !opt.isSpecificPoint);
            selectShippingOption(mainRelayOption || null);
        }
    };

    const handleProceedToPayment = () => {
        if (!selectedShippingOption) {
            showAlert('Erreur', 'Veuillez sélectionner une option de livraison.');
            return;
        }

        let finalAddressDetails = {};
        let displayAddressForConfirmation = '';

        if (selectedShippingOption.type === 'point_relais') {
            if (!selectedShippingOption.description || !selectedShippingOption.isSpecificPoint) {
                showAlert('Erreur', 'Veuillez rechercher et sélectionner un point relais spécifique.');
                return;
            }
            finalAddressDetails = {
                full_name: userProfileFullName || 'Client',
                address: selectedShippingOption.description,
                postal_code: selectedShippingOption.description.match(/\b\d{5}\b/)?.[0] || '',
                city: selectedShippingOption.name.split('(')[0].trim(),
                country: 'FRANCE',
                type: 'point_relais',
                name: selectedShippingOption.name
            };
            displayAddressForConfirmation = `${selectedShippingOption.name}\n${selectedShippingOption.description}`;
        } else {
            if (!userProfileAddress.trim() || !userProfilePostalCode.trim() || !userProfileCity.trim() || !userProfileCountry.trim()) {
                showAlert('Erreur', 'Votre adresse de livraison complète (adresse, code postal, ville, pays) est vide. Veuillez la mettre à jour dans votre profil.');
                return;
            }
            finalAddressDetails = {
                full_name: userProfileFullName || 'Client',
                address: userProfileAddress,
                postal_code: userProfilePostalCode,
                city: userProfileCity,
                country: userProfileCountry,
                type: selectedShippingOption.type
            };
            displayAddressForConfirmation = `${userProfileAddress}\n${userProfilePostalCode} ${userProfileCity}\n${userProfileCountry}`;
        }

        setIsConfirmingOrder(true);
        showAlert(
            "Confirmer la commande",
            `Sous-total: ${subtotal.toFixed(2)} €\nLivraison: ${selectedShippingOption.price.toFixed(2)} €\nTotal: ${totalAmount.toFixed(2)} €\n\nAdresse de livraison:\n${displayAddressForConfirmation}`,
            [
                { text: 'Annuler', onPress: () => { setIsConfirmingOrder(false); setShowCustomAlert(false); } },
                { text: 'Confirmer et Payer', onPress: () => confirmOrderAndPay(finalAddressDetails) }
            ]
        );
    };

    const confirmOrderAndPay = async (addressDetails) => {
        setIsConfirmingOrder(false);
        const paypalRedirectUrl = await proceedToPayment(addressDetails);

        if (paypalRedirectUrl) {
            try {
                await Linking.openURL(paypalRedirectUrl);
            } catch (linkingError) {
                showAlert('Erreur', 'Impossible d\'ouvrir la page de paiement PayPal. Veuillez réessayer.');
            }
        }
    };

    // Suppression avec double modal : confirmation puis succès
    const handleRemoveFromCart = (cart_item_id) => {
        setCustomAlertTitle('Supprimer la carte');
        setCustomAlertMessage('Voulez-vous vraiment retirer cette carte du panier ?');
        setCustomAlertButtons([
            { text: 'Annuler', onPress: () => setShowCustomAlert(false) },
            {
                text: 'Supprimer',
                onPress: async () => {
                    // On retire l'article sans afficher d'Alert natif
                    await removeFromCart(cart_item_id);
                    setCustomAlertTitle('Succès');
                    setCustomAlertMessage('Article retiré du panier avec succès.');
                    setCustomAlertButtons([{ text: 'OK', onPress: () => setShowCustomAlert(false) }]);
                }
            }
        ]);
        setShowCustomAlert(true);
    };

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image
                source={{ uri: item.card_photo || 'https://placehold.co/100x150/000000/FFFFFF?text=No+Image' }}
                style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.card_name} ({item.card_year})</Text>
                <Text style={styles.itemSeller}>Vendeur: {item.seller_pseudo}</Text>
                <Text style={styles.itemPrice}>{(parseFloat(item.price_at_addition) || 0).toFixed(2)} €</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveFromCart(item.cart_item_id)} style={styles.removeButton}>
                <Ionicons name="trash-outline" size={24} color="#FF6347" />
            </TouchableOpacity>
        </View>
    );

    if (loadingCart) {
        return (
            <ImageBackground
                source={require('../../assets/fond.png')}
                style={styles.background}
                resizeMode="cover"
            >
                <SafeAreaView style={styles.loadingContainer}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#C6B17A" />
                        <Text style={styles.loadingText}>Chargement du panier...</Text>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        );
    }

    const isRelaisSelected = selectedShippingOption?.type === 'point_relais';
    const isSpecificRelayPointSelected = isRelaisSelected && selectedShippingOption?.isSpecificPoint;

    const isCheckoutButtonEnabled =
        cartCount > 0 &&
        selectedShippingOption &&
        (isRelaisSelected
            ? isSpecificRelayPointSelected
            : userProfileAddress.trim() && userProfilePostalCode.trim() && userProfileCity.trim() && userProfileCountry.trim()
        );

    return (
        <ImageBackground
            source={require('../../assets/fond.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
                        <Text style={styles.header}>Mon Panier</Text>

                        {cartCount === 0 ? (
                            <Text style={styles.emptyCartText}>Votre panier est vide.</Text>
                        ) : (
                            <>
                                <FlatList
                                    data={cartItems}
                                    renderItem={renderCartItem}
                                    keyExtractor={(item) => item.cart_item_id.toString()}
                                    scrollEnabled={false}
                                />

                                <View style={styles.summaryContainer}>
                                    <Text style={styles.summaryText}>Sous-total : {subtotal.toFixed(2)} €</Text>

                                    <Text style={styles.sectionTitle}>Options de Livraison</Text>

                                    {displayedShippingOptions.length > 0 ? (
                                        displayedShippingOptions.map((option) => (
                                            <TouchableOpacity
                                                key={option.id}
                                                style={styles.shippingOption}
                                                onPress={() => selectShippingOption(option)}
                                            >
                                                <Ionicons
                                                    name={selectedShippingOption?.id === option.id ? 'radio-button-on' : 'radio-button-off'}
                                                    size={24}
                                                    color="#C6B17A"
                                                />
                                                <View style={styles.shippingOptionTextContainer}>
                                                    <Text style={styles.shippingOptionText}>
                                                        {option.name} ({(parseFloat(option.price) || 0).toFixed(2)} €)
                                                    </Text>
                                                    {option.description && (
                                                        <Text style={styles.shippingOptionDescription}>{option.description}</Text>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <Text style={styles.noShippingOptionsText}>Aucune option de livraison disponible.</Text>
                                    )}

                                    {isRelaisSelected && (
                                        <View style={styles.postalCodeContainer}>
                                            <TextInput
                                                style={styles.postalCodeInput}
                                                placeholder="Code Postal"
                                                placeholderTextColor="#888"
                                                keyboardType="numeric"
                                                maxLength={5}
                                                value={postalCode}
                                                onChangeText={handlePostalCodeChange}
                                            />
                                            <TouchableOpacity
                                                style={styles.searchPointsButton}
                                                onPress={handleSearchPointRelais}
                                                disabled={isSearchingPoints}
                                            >
                                                {isSearchingPoints ? (
                                                    <ActivityIndicator color="#1A1A1A" />
                                                ) : (
                                                    <Text style={styles.searchPointsButtonText}>Rechercher</Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    <Text style={styles.sectionTitle}>Adresse de Livraison</Text>
                                    <View style={styles.addressDisplayContainer}>
                                        {isRelaisSelected ? (
                                            isSpecificRelayPointSelected ? (
                                                <Text style={styles.addressDisplayText}>
                                                    {selectedShippingOption.name}{'\n'}
                                                    {selectedShippingOption.description}
                                                </Text>
                                            ) : (
                                                <Text style={styles.addressDisplayText}>Veuillez entrer un code postal et rechercher pour sélectionner un point relais.</Text>
                                            )
                                        ) : (
                                            userProfileAddress.trim() || userProfilePostalCode.trim() || userProfileCity.trim() || userProfileCountry.trim() ? (
                                                <>
                                                    {userProfileFullName.trim() ? <Text style={styles.addressDisplayText}>{userProfileFullName}</Text> : null}
                                                    {userProfileAddress.trim() ? <Text style={styles.addressDisplayText}>{userProfileAddress}</Text> : null}
                                                    {userProfilePostalCode.trim() || userProfileCity.trim() ? (
                                                        <Text style={styles.addressDisplayText}>
                                                            {userProfilePostalCode.trim()} {userProfileCity.trim()}
                                                        </Text>
                                                    ) : null}
                                                    {userProfileCountry.trim() ? (
                                                        <Text style={styles.addressDisplayText}>{userProfileCountry}</Text>
                                                    ) : null}
                                                    <Text style={styles.addressSmallText}>
                                                        Cette adresse sera envoyée au vendeur par email.
                                                    </Text>
                                                </>
                                            ) : (
                                                <Text style={styles.addressDisplayText}>
                                                    Votre adresse de livraison est vide. Veuillez la mettre à jour dans votre profil.
                                                </Text>
                                            )
                                        )}
                                    </View>

                                    <Text style={styles.totalText}>Total à Payer : {totalAmount.toFixed(2)} €</Text>

                                    <TouchableOpacity
                                        style={[
                                            styles.checkoutButton,
                                            !isCheckoutButtonEnabled && styles.checkoutButtonDisabled
                                        ]}
                                        onPress={handleProceedToPayment}
                                        disabled={!isCheckoutButtonEnabled || isConfirmingOrder}
                                    >
                                        <Text style={styles.checkoutButtonText}>Procéder au Paiement</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
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
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    safeArea: {
        flex: 1,
    },
    scrollViewContent: {
        padding: 15,
        paddingBottom: 30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#C6B17A',
        marginTop: 10,
        fontSize: 16
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 30,
        marginTop: Platform.OS === 'ios' ? 0 : 0,
        textAlign: 'center',
        letterSpacing: 2,
        textShadowColor: '#000',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    emptyCartText: { fontSize: 18, color: '#bbb', textAlign: 'center', marginTop: 50 },
    cartItem: { flexDirection: 'row', backgroundColor: 'rgba(42,42,42,0.8)', borderRadius: 10, padding: 10, marginBottom: 10, alignItems: 'center' },
    itemImage: { width: 80, height: 120, borderRadius: 8, marginRight: 15 },
    itemDetails: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: 'bold', color: '#E0E0E0', marginBottom: 5 },
    itemSeller: { fontSize: 14, color: '#bbb', marginBottom: 3 },
    itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#C6B17A' },
    removeButton: { padding: 10 },
    summaryContainer: { marginTop: 20, backgroundColor: 'rgba(42,42,42,0.8)', borderRadius: 10, padding: 15 },
    summaryText: { fontSize: 18, fontWeight: 'bold', color: '#E0E0E0', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#E0E0E0', marginTop: 15, marginBottom: 10 },
    postalCodeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    postalCodeInput: { flex: 1, backgroundColor: 'rgba(58,58,58,0.8)', borderRadius: 8, padding: 12, fontSize: 16, color: '#E0E0E0', marginRight: 10 },
    searchPointsButton: { backgroundColor: '#C6B17A', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 15, alignItems: 'center' },
    searchPointsButtonText: { color: '#1A1A1A', fontWeight: 'bold', fontSize: 14 },
    shippingOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(58,58,58,0.8)', borderRadius: 8, padding: 12, marginBottom: 8 },
    shippingOptionTextContainer: { marginLeft: 10, flex: 1 },
    shippingOptionText: { fontSize: 16, color: '#E0E0E0' },
    shippingOptionDescription: { fontSize: 12, color: '#bbb', marginTop: 2 },
    addressDisplayContainer: { backgroundColor: 'rgba(58,58,58,0.8)', borderRadius: 8, padding: 15, marginBottom: 20, justifyContent: 'center' },
    addressDisplayText: { fontSize: 16, color: '#E0E0E0' },
    addressSmallText: {
        fontSize: 12,
        color: '#bbb',
        marginTop: 5,
    },
    totalText: { fontSize: 22, fontWeight: 'bold', color: '#C6B17A', textAlign: 'right', marginTop: 20 },
    checkoutButton: { backgroundColor: '#C6B17A', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 20, marginBottom: 30 },
    checkoutButtonDisabled: { backgroundColor: '#888' },
    checkoutButtonText: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
});

export default CartScreen;
