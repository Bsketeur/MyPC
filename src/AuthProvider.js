// src/utils/AuthProvider.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../firebaseConfig'; // Assurez-vous que le chemin vers firebaseConfig est correct
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

// URL de base de votre API (sur Render.com)
const API_BASE_URL = 'https://api-xwqa.onrender.com/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // L'objet utilisateur de Firebase
  const [userId, setUserId] = useState(null); // L'ID de votre base de données MariaDB
  const [loading, setLoading] = useState(true); // État de chargement de l'authentification

  // 1. Effet pour écouter les changements d'état d'authentification Firebase
  // Ce useEffect ne dépend de rien et s'exécute une seule fois au montage pour configurer l'écouteur.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // console.log("AuthProvider: onAuthStateChanged triggered. firebaseUser:", firebaseUser ? firebaseUser.uid : "null");
      setUser(firebaseUser);
      // Le chargement initial de l'authentification Firebase est terminé.
      // La récupération de l'ID MariaDB sera gérée par un autre effet si nécessaire.
      setLoading(false); 
    });
    return unsubscribe; // Nettoyage de l'écouteur
  }, []); 

  // 2. Effet pour récupérer l'ID MariaDB lorsque l'utilisateur Firebase est disponible
  // et que l'ID MariaDB n'a pas encore été défini (ex: par RegisterScreen).
  const fetchMariaDbUserId = useCallback(async () => {
    if (user && userId === null) { // Seulement si l'utilisateur Firebase existe ET que l'ID MariaDB est null
      let fetchedId = null;
      let retries = 0;
      const maxRetries = 5; 
      let delay = 500; 

      while (fetchedId === null && retries < maxRetries) {
        try {
          // console.log(`AuthProvider: Tentative ${retries + 1}/${maxRetries} de récupération de l'ID MariaDB pour email: ${user.email}`);
          const res = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(user.email)}`);
          
          if (!res.ok) {
            const errorText = await res.text();
            // console.warn(`AuthProvider: Erreur API lors de la récupération de l'utilisateur MariaDB (Status: ${res.status}, Message: ${errorText}).`);
          } else {
            const data = await res.json();
            if (data && data.id) {
              fetchedId = data.id; 
              // console.log(`AuthProvider: MariaDB userId récupéré avec succès: ${fetchedId}`);
            } else {
              // console.warn("AuthProvider: Réponse API OK, mais 'id' manquant dans les données de l'utilisateur.");
            }
          }
        } catch (error) {
          // console.error("AuthProvider: Erreur lors de la récupération de l'ID utilisateur MariaDB :", error);
        }

        if (fetchedId === null) {
          retries++;
          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; 
          }
        }
      }
      setUserId(fetchedId); // Met à jour l'état userId après les tentatives
    }
  }, [user, userId]); // Dépend de 'user' et 'userId'

  // Déclenche la récupération de l'ID MariaDB lorsque 'user' ou 'userId' change
  useEffect(() => {
    fetchMariaDbUserId();
  }, [fetchMariaDbUserId]);

  return (
    <AuthContext.Provider value={{ user, userId, loading, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
