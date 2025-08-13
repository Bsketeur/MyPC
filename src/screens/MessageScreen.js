import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  TextInput,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const API_CONVERSATIONS = 'https://api-xwqa.onrender.com/api/conversations';
const API_USERS = 'https://api-xwqa.onrender.com/api/users';

const { width } = Dimensions.get('window');
const MAX_WIDTH = 800;

const MessageScreen = ({ route, navigation }) => {
  const { conversationId, currentUserId, otherUserId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userPseudos, setUserPseudos] = useState({});
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchPseudos = async () => {
      try {
        const [me, other] = await Promise.all([
          axios.get(`${API_USERS}/${currentUserId}`),
          axios.get(`${API_USERS}/${otherUserId}`),
        ]);
        setUserPseudos({
          [String(currentUserId)]: me.data.pseudo || 'Moi',
          [String(otherUserId)]: other.data.pseudo || 'Autre',
        });
      } catch {
        setUserPseudos({
          [String(currentUserId)]: 'Moi',
          [String(otherUserId)]: 'Autre',
        });
      }
    };
    fetchPseudos();
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    fetchMessages();
    resetUnreadCount();
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_CONVERSATIONS}/messages/${conversationId}`);
      setMessages(res.data || []);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Erreur lors du chargement des messages :', error);
    }
  };

  const resetUnreadCount = async () => {
    try {
      await axios.post(`${API_CONVERSATIONS}/reset-unread`, {
        conversation_id: conversationId,
        user_id: currentUserId,
      });
    } catch (error) {}
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    try {
      await axios.post(`${API_CONVERSATIONS}/messages/${conversationId}`, {
        sender_id: currentUserId,
        content: newMessage,
      });
      await axios.put(`${API_CONVERSATIONS}/${conversationId}`, {
        last_message: newMessage,
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  };

  const getPseudo = (item) => {
    if (item.senderPseudo) return item.senderPseudo;
    if (userPseudos[String(item.sender_id)]) return userPseudos[String(item.sender_id)];
    return 'Utilisateur';
  };

  const renderItem = ({ item }) => {
    const senderId = String(item.sender_id);
    const isMe = senderId === String(currentUserId);
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {/* <Text style={styles.pseudoText}>{getPseudo(item)}</Text> */}
        <Text
          style={[
            styles.messageText,
            isMe ? styles.myMessageText : styles.otherMessageText,
          ]}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/fond.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
        {/* Icône retour */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#C6B17A" />
        </TouchableOpacity>
        <View style={styles.centeredContainer}>
          <KeyboardAvoidingView
            style={styles.avoider}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id?.toString() || item.message_id?.toString() || Math.random().toString()}
              renderItem={renderItem}
              contentContainerStyle={[
                styles.messageList,
                { paddingBottom: 16 + (insets.bottom || 0) }
              ]}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              showsVerticalScrollIndicator={true}
              style={styles.flatList}
            />
            <View style={[styles.inputContainer, { marginBottom: insets.bottom || 0 }]}>
              <TextInput
                style={styles.input}
                placeholder="Tapez votre message..."
                placeholderTextColor="#C6B17A"
                value={newMessage}
                onChangeText={setNewMessage}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  newMessage.trim() === '' && styles.sendButtonDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={newMessage.trim() === ''}
                activeOpacity={0.8}
              >
                <Text style={styles.sendButtonText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 80 : 80, // Valeur augmentée pour décaler la flèche vers le bas
    left: 10,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 10,
  },
  centeredContainer: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 120 : 120, // Valeur augmentée pour décaler le contenu de la messagerie
    paddingBottom: 0,
  },
  avoider: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    justifyContent: 'flex-end',
  },
  flatList: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  messageList: {
    paddingTop: 12,
    minHeight: 100,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  messageContainer: {
    marginVertical: 5,
    padding: 13,
    borderRadius: 12,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 1,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#C6B17A',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(20,20,20,0.93)',
    borderWidth: 1,
    borderColor: '#C6B17A',
  },
  pseudoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C6B17A',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#181818',
  },
  otherMessageText: {
    color: '#C6B17A',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 0,
    borderColor: '#23201A',
    padding: 7,
    backgroundColor: 'rgba(20,20,20,0.90)',
    borderRadius: 10,
    marginTop: 7,
    marginHorizontal: 3,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: '#C6B17A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 6,
    color: '#C6B17A',
    fontSize: 16,
    backgroundColor: 'rgba(32,32,32,0.92)',
    minHeight: 40,
    maxHeight: 90,
  },
  sendButton: {
    backgroundColor: '#C6B17A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 65,
  },
  sendButtonDisabled: {
    backgroundColor: '#A9A9A9',
  },
  sendButtonText: {
    color: '#181818',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MessageScreen;
