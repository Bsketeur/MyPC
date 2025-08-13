import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ImageBackground,
    ActivityIndicator,
    ScrollView,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import CustomAlertModal from '../components/CustomAlertModal';

const API_URL = 'https://api-xwqa.onrender.com/api';
const { width } = Dimensions.get('window');
const MAX_WIDTH = 800;

// Helper pour format DATETIME MySQL/MariaDB
function nowSqlDatetime() {
    const d = new Date();
    return d.toISOString().slice(0, 19).replace('T', ' ');
}

const RegisterScreen = ({ navigation }) => {
    // NOUVEAU: États pour le nom et le prénom
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [pseudo, setPseudo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [paypal, setPaypal] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [acceptedCGU, setAcceptedCGU] = useState(false);
    const insets = useSafeAreaInsets();

    // Pour CustomAlertModal
    const [showCustomAlert, setShowCustomAlert] = useState(false);
    const [customAlertTitle, setCustomAlertTitle] = useState('');
    const [customAlertMessage, setCustomAlertMessage] = useState('');
    const [customAlertButtons, setCustomAlertButtons] = useState([]);

    const showAlert = (title, message, buttons = [{ text: 'OK', onPress: () => setShowCustomAlert(false) }]) => {
        setCustomAlertTitle(title);
        setCustomAlertMessage(message);
        setCustomAlertButtons(buttons);
        setShowCustomAlert(true);
    };

    const handleRegister = async () => {
        setError('');
        // Mise à jour de la validation pour inclure les nouveaux champs
        if (!firstName || !lastName || !pseudo || !email || !password || !confirmPassword || !address || !postalCode || !city || !country || !paypal) {
            setError('Tous les champs sont obligatoires.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (!acceptedCGU) {
            setError('Vous devez accepter les CGU et la politique de confidentialité.');
            return;
        }
        setLoading(true);

        const now = nowSqlDatetime();

        try {
            // Création Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Enregistrement dans Firestore (ajout de firstName et lastName)
            await setDoc(doc(db, 'users', user.uid), {
                first_name: firstName, // NOUVEAU: Ajout au Firestore
                last_name: lastName,   // NOUVEAU: Ajout au Firestore
                pseudo,
                email,
                address,
                postal_code: postalCode,
                city,
                country,
                paypal,
                cgu_accepted: true,
                cgu_accepted_at: now,
                privacy_accepted: true,
                privacy_accepted_at: now,
            });

            // Enregistrement dans la BDD via API (MariaDB) (ajout de first_name et last_name)
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firebase_ID: user.uid,
                    first_name: firstName, // NOUVEAU: Ajout à l'API MariaDB
                    last_name: lastName,   // NOUVEAU: Ajout à l'API MariaDB
                    pseudo,
                    email,
                    address,
                    postal_code: postalCode,
                    city,
                    country,
                    paypal,
                    cgu_accepted: true,
                    cgu_accepted_at: now,
                    privacy_accepted: true,
                    privacy_accepted_at: now,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erreur lors de l'enregistrement dans la base de données.");

            setLoading(false);
            showAlert(
                'Inscription réussie',
                'Votre compte a été créé avec succès. Vous allez être redirigé vers l\'accueil.',
                [{ text: 'OK', onPress: () => { setShowCustomAlert(false); } }]
            );
        } catch (err) {
            setLoading(false);
            let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'L\'adresse email est invalide.';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'Le mot de passe est trop faible (minimum 6 caractères).';
            } else if (err.message) {
                errorMessage = err.message;
            }
            showAlert('Erreur', errorMessage);
        }
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#111" />
            <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
                <ImageBackground
                    source={require('../../assets/fond.png')}
                    style={styles.background}
                    resizeMode="cover"
                >
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <ScrollView
                            contentContainerStyle={{
                                flexGrow: 1,
                                justifyContent: 'center',
                                paddingBottom: insets.bottom || 18,
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: MAX_WIDTH,
                                alignSelf: 'center',
                            }}
                            style={{ width: '100%' }}
                            showsVerticalScrollIndicator={true}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.innerContainer}>
                                <Text style={styles.title}>Inscription</Text>
                                {/* NOUVEAU: Champs Nom et Prénom */}
                                <TextInput
                                    placeholder="Prénom"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    style={styles.input}
                                    placeholderTextColor="#C6B17A"
                                />
                                <TextInput
                                    placeholder="Nom"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    style={styles.input}
                                    placeholderTextColor="#C6B17A"
                                />
                                {/* FIN NOUVEAU */}
                                <TextInput
                                    placeholder="Pseudo"
                                    value={pseudo}
                                    onChangeText={setPseudo}
                                    style={styles.input}
                                    placeholderTextColor="#C6B17A"
                                />
                                <TextInput
                                    placeholder="Email"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    style={styles.input}
                                    placeholderTextColor="#C6B17A"
                                    autoCapitalize="none"
                                />
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        placeholder="Mot de passe"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        style={styles.passwordInput}
                                        placeholderTextColor="#C6B17A"
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIconContainer}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Icon name={showPassword ? "eye-slash" : "eye"} size={20} color="#C6B17A" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        placeholder="Confirmer le mot de passe"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                        style={styles.passwordInput}
                                        placeholderTextColor="#C6B17A"
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIconContainer}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <Icon name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color="#C6B17A" />
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    placeholder="Adresse (ex: 24 rue de la Paix)"
                                    value={address}
                                    onChangeText={setAddress}
                                    style={styles.input}
                                    placeholderTextColor="#C6B17A"
                                />
                                <TextInput
                                    placeholder="Code Postal"
                                    value={postalCode}
                                    onChangeText={setPostalCode}
                                    keyboardType="numeric"
                                    maxLength={5}
                                    style={styles.input}
                                    placeholderTextColor="#C6B17A"
                                />
                                <TextInput
                                    placeholder="Ville"
                                    value={city}
                                    onChangeText={setCity}
                                    style={styles.input}
                                    placeholderTextColor="#C6B17A"
                                />
                                <TextInput
                                    placeholder="Pays"
                                    value={country}
                                    onChangeText={setCountry}
                                    style={styles.input}
                                    placeholderTextColor="#C6B17A"
                                />
                                <TextInput
                                    placeholder="Compte PayPal"
                                    value={paypal}
                                    onChangeText={setPaypal}
                                    keyboardType="email-address"
                                    style={styles.input}
                                    placeholderTextColor="#C6B17A"
                                    autoCapitalize="none"
                                />
                                {/* CGU Checkbox */}
                                <View style={styles.cguContainer}>
                                    <TouchableOpacity
                                        onPress={() => setAcceptedCGU(!acceptedCGU)}
                                        style={[
                                            styles.checkbox,
                                            acceptedCGU && styles.checkboxChecked,
                                        ]}
                                    >
                                        {acceptedCGU && <Icon name="check" size={16} color="#111" />}
                                    </TouchableOpacity>
                                    <Text style={styles.cguText}>
                                        J'accepte les{' '}
                                        <Text
                                            style={styles.link}
                                            onPress={() => navigation.navigate('CguScreen')}
                                        >
                                            CGU
                                        </Text>{' '}
                                        et la{' '}
                                        <Text
                                            style={styles.link}
                                            onPress={() => navigation.navigate('PrivacyScreen')}
                                        >
                                            politique de confidentialité
                                        </Text>
                                    </Text>
                                </View>
                                {error ? <Text style={styles.error}>{error}</Text> : null}
                                {loading && <ActivityIndicator size="large" color="#C6B17A" style={{ marginBottom: 10 }} />}
                                <TouchableOpacity
                                    onPress={handleRegister}
                                    style={[
                                        styles.button,
                                        (!acceptedCGU || loading) && { opacity: 0.5 },
                                    ]}
                                    disabled={!acceptedCGU || loading}
                                >
                                    <Text style={styles.buttonText}>S'inscrire</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.buttonSecondary}>
                                    <Text style={styles.buttonTextSecondary}>Retour</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </ImageBackground>
                <CustomAlertModal
                    isVisible={showCustomAlert}
                    title={customAlertTitle}
                    message={customAlertMessage}
                    buttons={customAlertButtons}
                />
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#111',
        padding: 0,
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        maxWidth: MAX_WIDTH,
        alignSelf: 'center',
        paddingVertical: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 30,
        textAlign: 'center',
        letterSpacing: 2,
        textShadowColor: '#000',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#C6B17A',
        padding: 14,
        marginBottom: 18,
        color: '#fff',
        borderRadius: 10,
        width: '90%',
        backgroundColor: 'transparent',
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#C6B17A',
        borderRadius: 10,
        marginBottom: 18,
        width: '90%',
        backgroundColor: 'transparent',
    },
    passwordInput: {
        flex: 1,
        padding: 14,
        color: '#fff',
        fontSize: 16,
    },
    eyeIconContainer: {
        padding: 10,
    },
    error: {
        color: '#FF5555',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#C6B17A',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 18,
        width: '90%',
        shadowColor: '#C6B17A',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 2,
    },
    buttonText: {
        color: '#111',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        borderColor: '#C6B17A',
        borderWidth: 0,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        width: '90%',
    },
    buttonTextSecondary: {
        color: '#C6B17A',
        fontSize: 16,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    cguContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        width: '90%',
        flexWrap: 'wrap',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: '#C6B17A',
        borderRadius: 6,
        marginRight: 12,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#C6B17A',
    },
    cguText: {
        color: '#C6B17A',
        fontSize: 14,
        flex: 1,
        flexWrap: 'wrap',
    },
    link: {
        color: '#fff',
        textDecorationLine: 'underline',
        fontWeight: 'bold',
    },
});

export default RegisterScreen;