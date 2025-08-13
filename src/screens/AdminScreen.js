import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Platform,
  ImageBackground,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// À adapter si besoin : l'id MariaDB de l'admin
const ADMIN_ID = 1;

const AdminScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // Fonction pour accéder à l'écran d'ajout de carte
  const handleAddCard = () => {
    navigation.navigate("AddCardScreen", { userId: ADMIN_ID });
  };

  return (
    <ImageBackground
      source={require("../../assets/fond.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        {/* Icône retour */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#C6B17A" />
        </TouchableOpacity>
        <View style={[styles.content, { paddingBottom: 30 + (insets.bottom || 0) }]}>
          <Text style={styles.title}>Espace Admin</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleAddCard}>
              <Text style={styles.buttonText}>Ajouter une Carte</Text>
            </TouchableOpacity>
            {/* Autres boutons admin peuvent être ajoutés ici */}
          </View>
          {loading && <ActivityIndicator size="large" color="#C6B17A" />}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "transparent",
    
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: "3%",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    // paddingBottom est désormais géré dynamiquement pour le safe area
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 60,
    left: 10,
    zIndex: 10,
    backgroundColor: "transparent",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 30,
    marginTop: 10,
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#C6B17A",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 8,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    color: "#181818",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AdminScreen;