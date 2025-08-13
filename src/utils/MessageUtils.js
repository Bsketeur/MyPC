import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { auth } from '../../firebaseConfig'; // Firebase Auth
import { db } from '../../firebaseConfig';   // Firestore

// 🔹 Récupère le pseudo de l'utilisateur connecté
export const fetchCurrentUserPseudo = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Aucun utilisateur n'est connecté.");
    }
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      return userData.pseudo || "Pseudo inconnu";
    } else {
      throw new Error("Aucun document trouvé pour cet utilisateur dans Firestore.");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du pseudo :", error);
    throw error;
  }
};

// 🔹 Récupère le pseudo de l'autre utilisateur (fonction supplémentaire)
export const fetchOtherUserPseudo = async (otherUserId) => {
  try {
    const userRef = doc(db, 'users', otherUserId);
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      return userData.pseudo || "Pseudo inconnu";
    } else {
      throw new Error("Aucun document trouvé pour cet utilisateur dans Firestore.");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du pseudo de l'autre utilisateur :", error);
    throw error;
  }
};

// 🔹 Crée ou ouvre une conversation entre deux utilisateurs
export const openConversation = async (currentUserId, otherUserId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Aucun utilisateur n'est connecté.");
    }
    if (!otherUserId) {
      throw new Error("L'ID de l'autre utilisateur est manquant.");
    }
    if (currentUserId === otherUserId) {
      throw new Error("Impossible de créer une conversation avec soi-même.");
    }
    const conversationId =
      currentUserId < otherUserId
        ? `${currentUserId}_${otherUserId}`
        : `${otherUserId}_${currentUserId}`;
    const conversationRef = doc(db, 'conversations', conversationId);
    const snapshot = await getDoc(conversationRef);
    if (!snapshot.exists()) {
      const pseudoCurrentUser = await fetchCurrentUserPseudo();
      const pseudoOtherUser = await fetchOtherUserPseudo(otherUserId);
      await setDoc(conversationRef, {
        participants: [currentUserId, otherUserId],
        pseudoParticipants: {
          [currentUserId]: pseudoCurrentUser,
          [otherUserId]: pseudoOtherUser,
        },
        lastMessage: '',
        lastMessageTimestamp: new Date(),
        unreadCounts: {
          [currentUserId]: 0,
          [otherUserId]: 0,
        }
      });
    }
    return conversationId;
  } catch (error) {
    console.error("❌ Erreur lors de l'ouverture de la conversation :", error);
    throw error;
  }
};

// 🔹 Envoie un message dans une conversation existante et incrémente le compteur de messages non lus
export const sendMessage = async (conversationId, senderId, receiverId, content, type = 'text') => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const messagesRef = collection(conversationRef, 'messages');

    // Récupère le pseudo de l'expéditeur
    let senderPseudo = '';
    try {
      senderPseudo = await fetchCurrentUserPseudo();
    } catch {
      senderPseudo = 'Utilisateur';
    }

    // Ajout du message dans la sous-collection "messages"
    await addDoc(messagesRef, {
      senderId,
      receiverId,
      senderPseudo, // <-- Ajout du pseudo dans le message
      content,
      type,
      timestamp: serverTimestamp(),
      read: false
    });

    // Mise à jour du dernier message et incrémentation du compteur pour le destinataire.
    await updateDoc(conversationRef, {
      lastMessage: content,
      lastMessageTimestamp: serverTimestamp(),
      [`unreadCounts.${receiverId}`]: increment(1)
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du message :", error);
    throw error;
  }
};