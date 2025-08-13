// src/utils/CartContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert, Linking } from 'react-native'; // Gardé pour référence, mais Alert.alert sera désactivé pour le panier

const CartContext = createContext();

// const API_BASE_URL = 'https://api-xwqa.onrender.com/api'; // Commenté car les appels API sont désactivés

export const CartProvider = ({ children, userId }) => {
    // Initialisation des états à des valeurs par défaut pour un panier inactif
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [shippingOptions, setShippingOptions] = useState([]);
    const [selectedShippingOption, setSelectedShippingOption] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loadingCart, setLoadingCart] = useState(false); // Mis à false par défaut car pas de chargement API

    // La fonction fetchCartData est commentée ou modifiée pour ne rien faire
    // car elle ne sera plus appelée par le useEffect principal.
    // Si vous avez besoin de la réactiver plus tard, décommentez-la.
    const fetchCartData = useCallback(async () => {
        console.log('CartContext: fetchCartData désactivée. Aucun appel API ne sera effectué.');
        setLoadingCart(false);
        setCartItems([]);
        setCartCount(0);
        setSubtotal(0);
        setShippingOptions([]);
        setSelectedShippingOption(null);
        // Toutes les logiques d'appel API et de traitement des erreurs sont ignorées ici
        // pour désactiver la fonctionnalité.
    }, []); // Dépendances vides car elle ne fait rien de dynamique

    // Ce useEffect est la source de l'erreur. Nous le commentons pour le désactiver.
    // useEffect(() => {
    //     fetchCartData();
    // }, [fetchCartData]);

    // Le calcul du total peut rester actif si vous voulez des valeurs locales,
    // mais comme le panier est vide, le total sera 0.
    useEffect(() => {
        const currentSubtotal = parseFloat(subtotal) || 0;
        const currentShippingCost = parseFloat(selectedShippingOption?.price || 0) || 0;
        const newTotal = currentSubtotal + currentShippingCost;
        setTotalAmount(newTotal);
    }, [subtotal, selectedShippingOption]);

    // Fonctions du panier modifiées pour être inactives
    const addToCart = useCallback(async (cardToAdd) => {
        console.log('CartContext: addToCart désactivé. Article non ajouté au panier:', cardToAdd);
        Alert.alert('Information', 'La fonctionnalité de panier est actuellement désactivée.');
        return false;
    }, []);

    const clearCartAndAdd = async (cardToAdd) => {
        console.log('CartContext: clearCartAndAdd désactivé. Panier non vidé et article non ajouté:', cardToAdd);
        Alert.alert('Information', 'La fonctionnalité de panier est actuellement désactivée.');
        return false;
    };

    const performAddToCart = async (cardId) => {
        console.log('CartContext: performAddToCart désactivé. Article non ajouté:', cardId);
        return false;
    };

    const removeFromCart = async (cartItemId) => {
        console.log('CartContext: removeFromCart désactivé. Article non supprimé:', cartItemId);
        Alert.alert('Information', 'La fonctionnalité de panier est actuellement désactivée.');
    };

    const selectShippingOption = useCallback((option) => {
        console.log('CartContext: selectShippingOption désactivé. Option non sélectionnée:', option);
        setSelectedShippingOption(null); // Réinitialise ou ne change rien
        Alert.alert('Information', 'La fonctionnalité de panier est actuellement désactivée.');
    }, []);

    const proceedToPayment = async (shippingAddress) => {
        console.log('CartContext: proceedToPayment désactivé. Paiement non initié.');
        Alert.alert('Information', 'La fonctionnalité de panier est actuellement désactivée.');
        return null;
    };

    const contextValue = {
        cartItems,
        cartCount,
        subtotal,
        shippingOptions,
        selectedShippingOption,
        totalAmount,
        loadingCart,
        addToCart,
        removeFromCart,
        selectShippingOption,
        proceedToPayment,
        fetchCartData: () => { console.log('CartContext: fetchCartData appelée mais désactivée.'); }, // Fournit une fonction vide
        setShippingOptions: () => { console.log('CartContext: setShippingOptions appelée mais désactivée.'); }, // Fournit une fonction vide
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};