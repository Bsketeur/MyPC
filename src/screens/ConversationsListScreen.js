import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Platform,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const API_CONVERSATIONS_BY_USER = 'https://api-xwqa.onrender.com/api/conversations/user';

const MAX_CONTENT_WIDTH = 800;
const { width } = Dimensions.get('window');

const ConversationItem = ({ conversation, currentUserId, navigateToMessageScreen }) => {
  return (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigateToMessageScreen(conversation.conversation_id, conversation.other_user_id)}
      activeOpacity={0.85}
    >
      <View style={styles.conversationRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.conversationText}>{conversation.other_user_pseudo || "Inconnu"}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {conversation.last_message || ""}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', minWidth: 40 }}>
          <Text style={styles.timestamp}>
            {conversation.last_message_timestamp
              ? new Date(conversation.last_message_timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
              : ''}
          </Text>
          {conversation.unread_count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{conversation.unread_count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ConversationsListScreen = ({ navigation, route }) => {
  const userId = route?.params?.userId;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!userId) return;
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_CONVERSATIONS_BY_USER}/${userId}`);
        setConversations(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [userId]);

  const navigateToMessageScreen = (conversationId, otherUserId) => {
    navigation.navigate('MessageScreen', {
      conversationId,
      currentUserId: userId,
      otherUserId,
    });
  };

  const renderConversation = ({ item }) => (
    <ConversationItem
      conversation={item}
      currentUserId={userId}
      navigateToMessageScreen={navigateToMessageScreen}
    />
  );

  return (
    <ImageBackground
      source={require('../../assets/fond.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
        {/* En-tête avec la flèche et le titre pour un meilleur contrôle du positionnement */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#C6B17A" />
          </TouchableOpacity>
          <Text style={styles.title}>Messagerie instantanée</Text>
          <View style={styles.emptySpace} />
        </View>

        <View style={styles.contentWrapper}>
          {loading ? (
            <ActivityIndicator size="large" color="#C6B17A" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.conversation_id?.toString()}
              renderItem={renderConversation}
              contentContainerStyle={[
                styles.listContainer,
                { paddingBottom: 30 + (insets.bottom || 0) }
              ]}
              ListEmptyComponent={
                <Text style={styles.emptyMessage}>
                  Aucune conversation trouvée.
                </Text>
              }
              showsVerticalScrollIndicator={true}
              style={styles.flatList}
            />
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  emptySpace: {
    width: 28 + 20, // Taille de l'icône + padding pour simuler l'alignement
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  listContainer: {
    paddingBottom: 30,
    paddingTop: 8,
  },
  flatList: {
    flex: 1,
  },
  conversationItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#23201A',
    backgroundColor: 'rgba(20,20,20,0.95)',
    marginBottom: 14,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 60,
    justifyContent: 'center',
  },
  conversationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: 0,
  },
  conversationText: {
    fontSize: 16,
    color: '#C6B17A',
    fontWeight: 'bold',
    flexShrink: 1,
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
    maxWidth: 420, // pour PC, limite l'étalement
  },
  timestamp: {
    fontSize: 12,
    color: '#C6B17A',
    opacity: 0.85,
    marginBottom: 2,
  },
  badge: {
    backgroundColor: '#FF5555',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#C6B17A',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default ConversationsListScreen;
